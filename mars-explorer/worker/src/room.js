/**
 * MarsRoom — Durable Object
 *
 * Each room has exactly 2 WebSocket connections (host + guest).
 * Handles:
 *   - WebSocket handshake & lifecycle
 *   - Real-time position relay between the two rovers
 *   - Authoritative collect deduplication (first-write-wins)
 *   - Heartbeat / ping-pong to detect stale connections
 *   - Room state stored in DO storage (survives Worker restarts)
 */

export class MarsRoom {
  constructor(state, env) {
    this.state = state;   // DO storage
    this.env = env;
    // In-memory connections (reset on cold start)
    this.sessions = new Map(); // role → { ws, playerName, alive }
    this.collected = new Set(); // mineral IDs collected this session
    this.roomCode = null;
    this.heartbeatInterval = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');         // 'host' | 'guest'
    const playerName = url.searchParams.get('playerName') || role;
    const code = url.searchParams.get('code');

    if (!role || !['host', 'guest'].includes(role)) {
      return new Response('Bad role', { status: 400 });
    }

    // Upgrade to WebSocket
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // Load persisted collected set from DO storage
    if (this.collected.size === 0) {
      const saved = await this.state.storage.get('collected');
      if (saved) saved.forEach(id => this.collected.add(id));
    }
    if (!this.roomCode && code) this.roomCode = code;

    // Close old connection for this role if any (reconnect case)
    const existing = this.sessions.get(role);
    if (existing) {
      try { existing.ws.close(1001, 'Replaced by new connection'); } catch {}
    }

    const session = { ws: server, playerName, role, alive: true };
    this.sessions.set(role, session);

    this._startHeartbeat();

    // Notify the just-connected player with current state
    this._send(server, {
      type: 'connected',
      role,
      playerName,
      collected: [...this.collected],
      peers: [...this.sessions.keys()].filter(r => r !== role),
    });

    // Notify the other player that a new rover joined
    this._broadcast(role, {
      type: 'peer_joined',
      role,
      playerName,
    });

    // ── Message handler ──────────────────────────────────────────
    server.addEventListener('message', async event => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      switch (msg.type) {

        // Position update — relay to the other player only
        case 'pos':
          this._broadcast(role, {
            type: 'pos',
            role,
            x: +msg.x || 0, y: +msg.y || 0, z: +msg.z || 0,
            rx: +msg.rx || 0, ry: +msg.ry || 0, rz: +msg.rz || 0,
          });
          break;

        // Collect mineral — authoritative dedup
        case 'collect': {
          const id = msg.id;
          if (this.collected.has(id)) {
            // Already collected — tell sender to revert
            this._send(server, { type: 'collect_denied', id });
            break;
          }
          this.collected.add(id);
          // Persist to DO storage
          await this.state.storage.put('collected', [...this.collected]);
          // Confirm to both players
          const collectMsg = { type: 'collect_ok', id, mineralType: msg.mineralType, by: role, byName: playerName };
          this._send(server, collectMsg);
          this._broadcast(role, collectMsg);
          break;
        }

        // Pong response to heartbeat
        case 'pong':
          session.alive = true;
          break;

        // Chat / mission log relay
        case 'chat':
          this._broadcast(role, { type: 'chat', from: playerName, text: String(msg.text || '').slice(0, 120) });
          break;

        default:
          break;
      }
    });

    // ── Close handler ─────────────────────────────────────────────
    server.addEventListener('close', () => {
      this.sessions.delete(role);
      this._broadcast(role, { type: 'peer_left', role, playerName });
      if (this.sessions.size === 0) this._stopHeartbeat();
    });

    server.addEventListener('error', () => {
      this.sessions.delete(role);
      if (this.sessions.size === 0) this._stopHeartbeat();
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  // ── Helpers ────────────────────────────────────────────────────

  _send(ws, data) {
    try { ws.send(JSON.stringify(data)); } catch {}
  }

  _broadcast(exceptRole, data) {
    for (const [role, session] of this.sessions) {
      if (role !== exceptRole) this._send(session.ws, data);
    }
  }

  _startHeartbeat() {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval = setInterval(() => {
      for (const [role, session] of this.sessions) {
        if (!session.alive) {
          // Didn't pong back — drop them
          try { session.ws.close(1001, 'Heartbeat timeout'); } catch {}
          this.sessions.delete(role);
          this._broadcast(role, { type: 'peer_left', role, playerName: session.playerName });
          continue;
        }
        session.alive = false;
        this._send(session.ws, { type: 'ping' });
      }
      if (this.sessions.size === 0) this._stopHeartbeat();
    }, 15000); // 15s heartbeat
  }

  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
