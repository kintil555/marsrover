# 🚀 MARS EXPLORER — Deploy Lewat Dashboard Web
## GitHub → Cloudflare Pages + Workers + KV (Tanpa Terminal)

---

## STRUKTUR FILE DI GITHUB

Pastikan repo kamu punya struktur seperti ini:
```
repo-kamu/
├── public/
│   ├── index.html
│   ├── 1773986894497_image.png
│   └── low_poly_rover__1_.glb
└── worker/
    └── index.js
```

Cara upload file ke GitHub tanpa terminal:
1. Buka repo → klik **Add file** → **Upload files**
2. Drag semua file sekaligus
3. Klik **Commit changes**

---

## BAGIAN 1 — Cloudflare Pages (Host Game)

### Langkah 1 — Login Cloudflare
Buka **https://dash.cloudflare.com** → login / daftar gratis.

### Langkah 2 — Buat Pages Project
1. Sidebar kiri → **Workers & Pages**
2. Tab **Pages** → klik **Create a project**
3. Pilih **Connect to Git**
4. Klik **Connect GitHub** → authorize Cloudflare
5. Pilih repo `mars-explorer` kamu → klik **Begin setup**

### Langkah 3 — Konfigurasi Build
Isi form seperti ini:

| Setting | Value |
|---|---|
| Project name | `mars-explorer` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | *(kosongkan)* |
| Build output directory | `public` |

Klik **Save and Deploy**.

Tunggu ~30 detik → dapat URL:
`https://mars-explorer.pages.dev`

✅ Game sudah live! Setiap push ke GitHub = auto-deploy.

---

## BAGIAN 2 — Cloudflare Worker (Backend)

### Langkah 4 — Buat Worker
1. Sidebar → **Workers & Pages** → tab **Workers**
2. Klik **Create a Worker**
3. Nama: `mars-explorer-api`
4. Klik **Deploy**
5. Klik **Edit code**
6. **Hapus semua** kode default
7. **Copy-paste** seluruh isi file `worker/index.js` dari repo
8. Klik **Save and Deploy**

### Langkah 5 — Buat KV Namespace
1. Sidebar → **Workers & Pages** → **KV**
2. Klik **Create a namespace**
3. Name: `MARS_KV`
4. Klik **Add**
5. **Salin ID** yang muncul (panjang ~32 karakter) — simpan

### Langkah 6 — Bind KV ke Worker
1. Sidebar → **Workers & Pages** → klik `mars-explorer-api`
2. Tab **Settings** → scroll ke **Bindings**
3. Klik **Add binding** → pilih **KV namespace**
   - Variable name: `MARS_KV`
   - KV namespace: pilih `MARS_KV`
4. Klik **Save**

### Langkah 7 — Bind Durable Object ke Worker
1. Masih di Settings → Bindings
2. Klik **Add binding** → pilih **Durable Object namespace**
   - Variable name: `GAME_ROOM`
   - Durable Object namespace: pilih `GameRoom` (dari worker yang sama)
3. Klik **Save**

> ⚠️ Durable Objects perlu **Workers Paid ($5/bulan)**.
> Alternatif gratis: skip langkah ini, multiplayer dinonaktifkan,
> leaderboard KV tetap jalan.

---

## BAGIAN 3 — Sambungkan Worker ke Pages

### Langkah 8 — Tambah Worker Route ke Pages
1. Sidebar → **Workers & Pages** → klik project `mars-explorer` (Pages)
2. Tab **Settings** → **Functions**
3. Scroll ke bagian **KV namespace bindings**:
   - Klik **Add binding**
   - Variable: `MARS_KV` → pilih namespace `MARS_KV`
4. Scroll ke **Durable Object bindings**:
   - Klik **Add binding**
   - Variable: `GAME_ROOM` → pilih `GameRoom`

### Langkah 9 — Route /api/* ke Worker
1. Sidebar → **Workers & Pages** → klik `mars-explorer-api` (Worker)
2. Tab **Settings** → **Triggers**
3. Klik **Add route**
   - Route: `mars-explorer.pages.dev/api/*`
   - Zone: pilih zone yang sesuai (atau `*.pages.dev`)
4. Klik **Save**

Sekarang semua request ke `/api/*` otomatis ke Worker.

---

## BAGIAN 4 — Update URL di index.html

Buka `public/index.html` di GitHub (klik file → klik ✏️ edit):

Cari baris (sekitar baris 495):
```js
return '';  // same-origin — route /api/* ke Worker
```

Jika route sudah terhubung same-origin, biarkan `return ''`.

Jika Worker di domain berbeda, ganti dengan:
```js
return 'https://mars-explorer-api.USERNAME.workers.dev';
```

Klik **Commit changes** → Cloudflare Pages auto-redeploy.

---

## ✅ Hasil Akhir

```
Browser
  ↓
https://mars-explorer.pages.dev
  ├── /              → index.html  (Pages CDN)
  ├── /*.png, *.glb  → static files (Pages CDN)
  └── /api/*         → Worker
        ├── POST /api/room/create   → Durable Object (room baru)
        ├── GET  /api/room/XX/join  → WebSocket realtime
        ├── GET  /api/leaderboard   → KV (baca skor)
        └── POST /api/leaderboard   → KV (simpan skor)
```

| Komponen | Platform | Biaya |
|---|---|---|
| Game hosting | Cloudflare Pages | Gratis |
| CDN global | Cloudflare | Gratis |
| Worker backend | Workers | Gratis (100rb req/hari) |
| Leaderboard | KV | Gratis (100rb reads/hari) |
| Multiplayer | Durable Objects | $5/bulan |
| Auto-deploy | GitHub → Pages | Gratis |

---

## 🔄 Update Game Setelah Deploy

Cukup push ke GitHub:
1. Edit file di GitHub web editor (klik ✏️)
2. Klik **Commit changes**
3. Cloudflare Pages otomatis rebuild & deploy dalam ~30 detik

---

## 🆘 Troubleshooting

**Build output directory salah → game tidak muncul**
→ Pastikan Build output directory diisi `public` (bukan `/public` atau kosong)

**Tekstur hitam / tidak muncul**
→ Pastikan nama file persis `1773986894497_image.png` di folder `public/`

**Multiplayer "room not found"**
→ Cek route `/api/*` sudah mengarah ke Worker yang benar

**CORS error**
→ Worker sudah handle CORS. Pastikan URL WORKER_URL tidak ada trailing slash
