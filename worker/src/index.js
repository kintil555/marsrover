/**
 * MARS EXPLORER — Cloudflare Worker
 * Routes:
 *   POST /room/create          → create room, returns { roomCode, token }
 *   POST /room/join            → join room, returns { roomCode, token, hostToken }
 *   GET  /room/:code/ws        → WebSocket upgrade → Durable Object
 *   GET  /room/:code/state     → get room state (KV)
 *   GET  /leaderboard          → top scores from KV
 *   POST /leaderboard          → submit score
 *   DELETE /room/:code         → close room (host only)
 */

import { MarsRoom } from './room.js';
export { MarsRoom };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

function genCode(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  arr.forEach(b => (s += chars[b % chars.length]));
  return s;
}

function genToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[+/=]/g, '');
}

// ─────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ── POST /room/create ──────────────────────────────────────────
    if (method === 'POST' && path === '/room/create') {
      let body = {};
      try { body = await request.json(); } catch {}
      const playerName = String(body.playerName || 'ROVER-1').slice(0, 20);

      // Generate unique room code
      let code, exists;
      do {
        code = genCode();
        exists = await env.MARS_KV.get(`room:${code}`);
      } while (exists);

      const hostToken = genToken();
      const roomMeta = {
        code,
        hostToken,
        hostName: playerName,
        guestName: null,
        guestToken: null,
        createdAt: Date.now(),
        status: 'waiting', // waiting | active | closed
        collected: [],     // list of collected mineral IDs (shared state)
      };

      await env.MARS_KV.put(`room:${code}`, JSON.stringify(roomMeta), {
        expirationTtl: parseInt(env.ROOM_TTL_SECONDS || '3600'),
      });

      return json({ roomCode: code, token: hostToken, role: 'host', playerName });
    }

    // ── POST /room/join ────────────────────────────────────────────
    if (method === 'POST' && path === '/room/join') {
      let body = {};
      try { body = await request.json(); } catch {}
      const code = String(body.roomCode || '').toUpperCase().slice(0, 4);
      const playerName = String(body.playerName || 'ROVER-2').slice(0, 20);

      const raw = await env.MARS_KV.get(`room:${code}`);
      if (!raw) return err('Room not found or expired', 404);

      const meta = JSON.parse(raw);
      if (meta.status === 'closed') return err('Room is closed', 410);
      if (meta.guestToken) return err('Room is full', 409);

      const guestToken = genToken();
      meta.guestName = playerName;
      meta.guestToken = guestToken;
      meta.status = 'active';

      await env.MARS_KV.put(`room:${code}`, JSON.stringify(meta), {
        expirationTtl: parseInt(env.ROOM_TTL_SECONDS || '3600'),
      });

      return json({
        roomCode: code,
        token: guestToken,
        role: 'guest',
        playerName,
        hostName: meta.hostName,
        collected: meta.collected,
      });
    }

    // ── GET /room/:code/state ──────────────────────────────────────
    const stateMatch = path.match(/^\/room\/([A-Z0-9]{4})\/state$/);
    if (method === 'GET' && stateMatch) {
      const code = stateMatch[1];
      const raw = await env.MARS_KV.get(`room:${code}`);
      if (!raw) return err('Room not found', 404);
      const meta = JSON.parse(raw);
      return json({ code: meta.code, status: meta.status, hostName: meta.hostName, guestName: meta.guestName, collected: meta.collected });
    }

    // ── GET /room/:code/ws  (WebSocket upgrade → Durable Object) ──
    const wsMatch = path.match(/^\/room\/([A-Z0-9]{4})\/ws$/);
    if (method === 'GET' && wsMatch) {
      const code = wsMatch[1];
      const token = url.searchParams.get('token');
      if (!token) return err('Missing token', 401);

      // Validate token against KV
      const raw = await env.MARS_KV.get(`room:${code}`);
      if (!raw) return err('Room not found', 404);
      const meta = JSON.parse(raw);
      if (token !== meta.hostToken && token !== meta.guestToken) {
        return err('Invalid token', 403);
      }
      const role = token === meta.hostToken ? 'host' : 'guest';
      const playerName = role === 'host' ? meta.hostName : meta.guestName;

      // Route to Durable Object keyed by room code
      const doId = env.ROOMS.idFromName(code);
      const stub = env.ROOMS.get(doId);

      // Forward request with role header so DO knows who connected
      const fwdUrl = new URL(request.url);
      fwdUrl.searchParams.set('role', role);
      fwdUrl.searchParams.set('playerName', playerName);
      fwdUrl.searchParams.set('code', code);
      const fwdReq = new Request(fwdUrl, request);
      return stub.fetch(fwdReq);
    }

    // ── DELETE /room/:code ─────────────────────────────────────────
    const delMatch = path.match(/^\/room\/([A-Z0-9]{4})$/);
    if (method === 'DELETE' && delMatch) {
      const code = delMatch[1];
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      const raw = await env.MARS_KV.get(`room:${code}`);
      if (!raw) return err('Room not found', 404);
      const meta = JSON.parse(raw);
      if (token !== meta.hostToken) return err('Forbidden', 403);
      meta.status = 'closed';
      await env.MARS_KV.put(`room:${code}`, JSON.stringify(meta), { expirationTtl: 60 });
      return json({ ok: true });
    }

    // ── GET /leaderboard ──────────────────────────────────────────
    if (method === 'GET' && path === '/leaderboard') {
      const raw = await env.MARS_KV.get('leaderboard');
      const board = raw ? JSON.parse(raw) : [];
      return json(board.slice(0, 20));
    }

    // ── POST /leaderboard ─────────────────────────────────────────
    if (method === 'POST' && path === '/leaderboard') {
      let body = {};
      try { body = await request.json(); } catch {}
      const name = String(body.name || 'UNKNOWN').slice(0, 20);
      const iron = parseInt(body.iron) || 0;
      const water = parseInt(body.water) || 0;
      const timeMs = parseInt(body.timeMs) || 0;

      if (water < 1) return err('No score to submit');

      const raw = await env.MARS_KV.get('leaderboard');
      const board = raw ? JSON.parse(raw) : [];
      board.push({ name, iron, water, timeMs, date: Date.now() });
      board.sort((a, b) => {
        if (b.water !== a.water) return b.water - a.water;
        if (b.iron !== a.iron) return b.iron - a.iron;
        return a.timeMs - b.timeMs;
      });
      await env.MARS_KV.put('leaderboard', JSON.stringify(board.slice(0, 100)));
      return json({ ok: true, rank: board.findIndex(e => e.name === name && e.timeMs === timeMs) + 1 });
    }

    // ── 404 ───────────────────────────────────────────────────────
    return err('Not found', 404);
  },
};
