# MARS EXPLORER — Deployment Guide

## Architecture

```
Browser (index.html)
    │  HTTP REST  ─→  Cloudflare Worker (src/index.js)
    │                       │  room create/join  ─→  KV Namespace (MARS_KV)
    │  WebSocket  ─→  Durable Object (MarsRoom)
    │                       │  authoritative collect state ─→  DO Storage
    └─────────────────────────────────────────────────────────────────────
```

- **Worker** handles REST API: create room, join room, leaderboard
- **KV** stores room metadata + leaderboard (persisted, global edge)
- **Durable Object** manages live WebSocket connections per room — exactly 1 DO instance per room code, handles relay + dedup
- **Cloudflare Pages** serves the static `index.html`

---

## Step 1 — Prerequisites

```bash
npm install -g wrangler
wrangler login
```

---

## Step 2 — Deploy the Worker

```bash
cd worker

# Create KV namespace
wrangler kv:namespace create MARS_KV
# → outputs: id = "abc123..."   ← copy this

wrangler kv:namespace create MARS_KV --preview
# → outputs: preview_id = "def456..."   ← copy this too
```

Edit `wrangler.toml` — replace the placeholder IDs:
```toml
[[kv_namespaces]]
binding = "MARS_KV"
id = "abc123..."           # ← from above
preview_id = "def456..."   # ← from above
```

Then deploy:
```bash
wrangler deploy
# → Deployed to: https://mars-explorer-server.YOUR-SUBDOMAIN.workers.dev
```

---

## Step 3 — Update index.html

Open `client/index.html` and find this line near the top of the `<script>`:

```js
const WORKER_URL = 'https://mars-explorer-server.YOUR-SUBDOMAIN.workers.dev';
```

Replace `YOUR-SUBDOMAIN` with your actual Cloudflare Workers subdomain.

---

## Step 4 — Deploy the frontend (Cloudflare Pages)

```bash
cd client

# Put your asset files here alongside index.html:
#   1773986894497_image.png   (Mars surface texture)
#   low_poly_rover__1_.glb    (rover model)
```

**Option A — Cloudflare Pages dashboard:**
1. Go to https://dash.cloudflare.com → Pages → Create project
2. Connect GitHub repo OR use "Direct Upload"
3. Upload the `client/` folder
4. No build command needed, output dir = `/`

**Option B — Wrangler CLI:**
```bash
wrangler pages deploy client/ --project-name mars-explorer
```

---

## Step 5 — Configure CORS (optional but recommended)

In `worker/src/index.js`, change the CORS header to only allow your Pages domain:

```js
const CORS = {
  'Access-Control-Allow-Origin': 'https://mars-explorer.pages.dev',
  ...
};
```

---

## File structure

```
mars-explorer/
├── worker/
│   ├── wrangler.toml          ← Worker config (KV IDs go here)
│   └── src/
│       ├── index.js           ← HTTP router + Worker entry
│       └── room.js            ← Durable Object (WebSocket relay)
└── client/
    ├── index.html             ← Full game (edit WORKER_URL)
    ├── 1773986894497_image.png ← Mars texture (rename from upload)
    └── low_poly_rover__1_.glb  ← Rover 3D model
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/room/create` | `{playerName}` → `{roomCode, token, role}` |
| POST | `/room/join` | `{roomCode, playerName}` → `{token, role, collected[]}` |
| GET | `/room/:code/ws?token=` | WebSocket upgrade → Durable Object |
| GET | `/room/:code/state` | Room metadata (status, players) |
| GET | `/leaderboard` | Top 20 scores |
| POST | `/leaderboard` | `{name, iron, water, timeMs}` → `{rank}` |
| DELETE | `/room/:code` | Close room (host only, `Authorization: Bearer <token>`) |

---

## WebSocket Message Protocol

### Client → Server
| type | payload | description |
|------|---------|-------------|
| `pos` | `{x,y,z,rx,ry,rz}` | Rover position (sent every ~90ms) |
| `collect` | `{id, mineralType}` | Attempt to collect mineral |
| `pong` | — | Heartbeat response |
| `chat` | `{text}` | Mission log message |

### Server → Client
| type | payload | description |
|------|---------|-------------|
| `connected` | `{role, collected[]}` | Welcome + current state |
| `peer_joined` | `{role, playerName}` | Co-pilot connected |
| `peer_left` | `{role}` | Co-pilot disconnected |
| `pos` | `{role, x,y,z,rx,ry,rz}` | Other rover position |
| `collect_ok` | `{id, mineralType, by, byName}` | Authoritative collect confirm |
| `collect_denied` | `{id}` | Mineral already taken |
| `ping` | — | Heartbeat (reply with pong) |
| `chat` | `{from, text}` | Incoming message |

---

## Troubleshooting

**WebSocket fails to connect**
- Check `WORKER_URL` in `index.html` matches your deployed Worker URL exactly
- Make sure Durable Objects are enabled on your Cloudflare plan (free tier supports them)

**Room code not found**
- KV entries expire after 1 hour (configurable via `ROOM_TTL_SECONDS` in `wrangler.toml`)

**Position lag**
- Worker runs at Cloudflare edge closest to each player; if both players are on different continents, Durable Object lives near the host — consider using `locationHint` in production
