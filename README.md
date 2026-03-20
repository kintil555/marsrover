/**
 * ================================================================
 *  MARS EXPLORER — Cloudflare Worker
 *  Stack: Worker (routing) + Durable Objects (WS game server) + KV (skor)
 * ================================================================
 *
 *  Endpoints:
 *    POST /api/room/create               → { roomCode }
 *    GET  /api/room/:CODE/join?name=X    → WebSocket upgrade → Durable Object
 *    GET  /api/leaderboard               → top 20 skor dari KV
 *    POST /api/leaderboard               → simpan skor ke KV
 *    GET  /api/ping                      → health check
 *
 *  Semua aset statis (index.html, .glb, .png) di-serve dari /public
 *  via Cloudflare Pages / Workers Assets binding.
 */

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const corsH = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsH },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

// Kode room: 4 karakter, huruf besar + angka, tanpa O/0/I/1 (biar mudah dibaca)
function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─────────────────────────────────────────────────────────────
//  MAIN WORKER — HTTP Router
// ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsH });
    }

    // ── Static assets (index.html, .glb, .png) ──
    // Cloudflare akan serve dari /public secara otomatis via ASSETS binding
    // Tapi kita handle /api/* dulu, sisanya ke ASSETS
    if (!path.startsWith('/api/')) {
      // Serve static file
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response('Not found', { status: 404 });
    }

    // ── POST /api/room/create ──────────────────────────────────
    if (path === '/api/room/create' && request.method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}

      const hostName = String(body.name || 'ROVER-1').slice(0, 20);

      // Coba generate kode unik (cek collision di KV)
      let code, attempts = 0;
      do {
        code = genRoomCode();
        attempts++;
        if (attempts > 10) return err('Server busy, coba lagi');
      } while (await env.MARS_KV.get(`room:active:${code}`));

      // Tandai room aktif di KV (TTL 2 jam — auto cleanup)
      await env.MARS_KV.put(`room:active:${code}`, '1', { expirationTtl: 7200 });

      // Inisialisasi Durable Object untuk room ini
      const doId = env.GAME_ROOM.idFromName(code);
      const stub = env.GAME_ROOM.get(doId);
      await stub.fetch(new Request('http://do-internal/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, hostName }),
      }));

      return json({ roomCode: code });
    }

    // ── GET /api/room/:CODE/join  (WebSocket upgrade) ─────────
    const wsMatch = path.match(/^\/api\/room\/([A-Z2-9]{4})\/join$/);
    if (wsMatch) {
      const code = wsMatch[1];

      // Pastikan room terdaftar (basic check)
      const active = await env.MARS_KV.get(`room:active:${code}`);
      if (!active) return err('Room tidak ditemukan atau sudah berakhir', 404);

      // Teruskan ke Durable Object — ia yang handle WebSocket
      const doId = env.GAME_ROOM.idFromName(code);
      const stub = env.GAME_ROOM.get(doId);
      return stub.fetch(request);
    }

    // ── GET /api/leaderboard ─────────────────────────────────
    if (path === '/api/leaderboard' && request.method === 'GET') {
      const list = await env.MARS_KV.list({ prefix: 'score:' });
      const entries = await Promise.all(
        list.keys.slice(0, 50).map(k => env.MARS_KV.get(k.name, { type: 'json' }))
      );
      // Sort: water terbanyak dulu, lalu waktu tercepat
      const sorted = entries
        .filter(Boolean)
        .sort((a, b) => b.water - a.water || a.time - b.time)
        .slice(0, 20);
      return json(sorted);
    }

    // ── POST /api/leaderboard ────────────────────────────────
    if (path === '/api/leaderboard' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return err('Invalid JSON'); }

      if (!body || typeof body.name !== 'string' || body.name.length === 0) {
        return err('name wajib diisi');
      }

      const entry = {
        name:  String(body.name).slice(0, 20),
        water: Math.min(15, Math.max(0, Number(body.water) | 0)),
        iron:  Math.min(30, Math.max(0, Number(body.iron)  | 0)),
        time:  Math.max(0,              Number(body.time)  | 0),
        mp:    body.mp ? true : false,
        ts:    Date.now(),
      };

      // Hanya simpan jika minimal 1 water mineral ditemukan
      if (entry.water === 0) return json({ ok: false, reason: 'No minerals found' });

      // Key untuk natural sort: water desc, time asc
      const wPad = String(15 - entry.water).padStart(2, '0');
      const tPad = String(entry.time).padStart(8, '0');
      const rand = Math.random().toString(36).slice(2, 7);
      const key  = `score:${wPad}:${tPad}:${rand}`;

      // Simpan di KV — expire 180 hari
      await env.MARS_KV.put(key, JSON.stringify(entry), {
        expirationTtl: 60 * 60 * 24 * 180,
      });

      return json({ ok: true });
    }

    // ── GET /api/ping ────────────────────────────────────────
    if (path === '/api/ping') {
      return json({ ok: true, ts: Date.now(), version: env.GAME_VERSION || '2.0' });
    }

    return err('Endpoint tidak ditemukan', 404);
  },
};

// ═════════════════════════════════════════════════════════════
//  DURABLE OBJECT — GameRoom
//
//  Satu instance per room code. Hidup selama ada koneksi aktif.
//  Mengelola:
//    - WebSocket sessions (max 2 pemain)
//    - Posisi rover (broadcast antar pemain)
//    - State game (minerals collected) — server-authoritative
//    - Auto-cleanup setelah 30 menit tidak aktif
// ═════════════════════════════════════════════════════════════
export class GameRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();   // sid (number) → SessionInfo
    this.nextSid = 0;
    this.roomCode = null;
    this.hostName = null;
    this.gameState = {
      collected: [],             // array mineral ID yang sudah dikumpulkan
      started:   false,
      startTime: null,
    };
    this.alarmSet = false;
  }

  // Cloudflare memanggil ini ketika ada HTTP/WS request ke DO ini
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── Inisialisasi room dari Worker ──
    if (path === '/init' && request.method === 'POST') {
      const body = await request.json();
      this.roomCode = body.code;
      this.hostName = body.hostName;
      this.gameState = { collected: [], started: false, startTime: null };
      // Set alarm cleanup 2 jam dari sekarang
      await this.state.storage.setAlarm(Date.now() + 2 * 60 * 60 * 1000);
      return new Response('ok');
    }

    // ── WebSocket upgrade request ──
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // Max 2 pemain per room
    if (this.sessions.size >= 2) {
      return new Response('Room penuh (maks 2 pemain)', { status: 409 });
    }

    // Buat WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Daftarkan ke Durable Object state agar pesan tetap diterima
    this.state.acceptWebSocket(server);

    const sid = this.nextSid++;
    const role = this.sessions.size === 0 ? 'host' : 'guest';
    const name = url.searchParams.get('name') || (role === 'host' ? 'ROVER-1' : 'ROVER-2');

    // Simpan session
    this.sessions.set(sid, { ws: server, name, role, lastPos: null });

    // Kirim welcome ke pemain baru
    this._send(server, {
      type: 'welcome',
      sid,
      role,
      roomCode: this.roomCode,
      totalPlayers: this.sessions.size,
      gameState: this.gameState,
    });

    // Beritahu pemain lain ada yang join
    this._broadcast({
      type: 'player_joined',
      sid,
      name,
      role,
      totalPlayers: this.sessions.size,
    }, sid);

    // Jika kedua pemain sudah ada → mulai game
    if (this.sessions.size === 2 && !this.gameState.started) {
      this.gameState.started = true;
      this.gameState.startTime = Date.now();
      this._broadcastAll({
        type: 'game_start',
        startTime: this.gameState.startTime,
      });
    }

    // Attach event handlers
    server.addEventListener('message', evt => this._onMessage(sid, evt.data));
    server.addEventListener('close',   ()  => this._onClose(sid));
    server.addEventListener('error',   ()  => this._onClose(sid));

    return new Response(null, { status: 101, webSocket: client });
  }

  // Dipanggil oleh Cloudflare alarm untuk cleanup room
  async alarm() {
    // Tutup semua WebSocket yang masih terbuka
    for (const { ws } of this.sessions.values()) {
      try { ws.close(1001, 'Room expired'); } catch {}
    }
    this.sessions.clear();
  }

  // ── Message handler ──────────────────────────────────────
  _onMessage(sid, raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const session = this.sessions.get(sid);
    if (!session) return;

    switch (msg.type) {

      // Posisi rover — forward ke pemain lain saja
      case 'pos':
        if (typeof msg.x !== 'number') break;
        session.lastPos = { x: msg.x, y: msg.y, z: msg.z };
        this._broadcast({
          type: 'pos',
          sid,
          x: msg.x, y: msg.y, z: msg.z,
          rx: msg.rx || 0, ry: msg.ry || 0, rz: msg.rz || 0,
        }, sid);
        break;

      // Collect mineral — server-authoritative: validasi + broadcast ke semua
      case 'collect':
        if (typeof msg.id !== 'number') break;
        if (!this.gameState.collected.includes(msg.id)) {
          this.gameState.collected.push(msg.id);
          // Broadcast ke SEMUA (termasuk pengirim = konfirmasi)
          this._broadcastAll({
            type: 'collect_confirm',
            id: msg.id,
            mineralType: msg.mineralType || 'iron',
            collectorSid: sid,
          });
        } else {
          // Sudah dikumpulkan — kirim balik konfirmasi agar client sync
          this._send(session.ws, {
            type: 'collect_confirm',
            id: msg.id,
            mineralType: msg.mineralType || 'iron',
            collectorSid: -1,  // sudah terkumpul sebelumnya
          });
        }
        break;

      // Ping/keepalive
      case 'ping':
        this._send(session.ws, { type: 'pong', ts: msg.ts || Date.now() });
        break;

      default:
        break;
    }
  }

  _onClose(sid) {
    const session = this.sessions.get(sid);
    if (session) {
      this.sessions.delete(sid);
      this._broadcastAll({ type: 'player_left', sid, name: session.name });
    }
  }

  // ── Send helpers ─────────────────────────────────────────
  _send(ws, obj) {
    try { ws.send(JSON.stringify(obj)); } catch {}
  }

  _broadcast(obj, excludeSid) {
    for (const [sid, { ws }] of this.sessions) {
      if (sid !== excludeSid) this._send(ws, obj);
    }
  }

  _broadcastAll(obj) {
    for (const { ws } of this.sessions.values()) {
      this._send(ws, obj);
    }
  }
}
