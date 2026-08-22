# Як сервер: frontend + backend

Railway trial тамом шуд, бинобар ин frontend ва backend-ро **дар як ҷо** мегузорем.
База ҳамон **Neon** мемонад.

Сайт аз як URL кушода мешавад (масалан `https://nurov.onrender.com`). Login осонтар кор мекунад.

---

## Тағйирёбандаҳо (ҳама ҷо як хел)

| Ном | Қимат |
|-----|--------|
| `DATABASE_URL` | Neon **pooled** (`?sslmode=require`) |
| `DIRECT_URL` | Neon **direct**. Агар як URL доред — ҳамонро ду бор |
| `NODE_ENV` | `production` |
| `JWT_ACCESS_SECRET` | `b7340078817a4a9c4457c1db0fe4c6b8627e021d750f9140a8d3203dcdc93cb7` |
| `JWT_REFRESH_SECRET` | `c6220e71dedd4c741645ad275f95c24cce3154add184ea11b6b7479320db9ad9` |
| `FRONTEND_URL` | URL-и ҳамин сайт (баъд аз deploy иваз кунед) |
| `COOKIE_SAMESITE` | `lax` |
| `CLOUDINARY_URL` | ихтиёрӣ |

`PORT` нагузоред — хост худаш мегузорад.

Пеш аз ҳама: коди нав (Dockerfile) бояд дар GitHub бошад.

---

## Роҳи 1 — Render (осонтар, мисли Railway)

1. [render.com](https://render.com) → Sign up бо GitHub.
2. **New** → **Blueprint** (ё Web Service).
3. Репо: `nurov-web/marketplyser`.
4. Агар Web Service дастӣ:
   - Runtime: **Docker**
   - Dockerfile path: `Dockerfile`
   - Root: решаи репо (на `frontend`)
5. Variables-ро аз ҷадвал гузоред.
   `FRONTEND_URL` ҳоло: `https://example.com` (баъд иваз мекунед).
6. Deploy.
7. URL мегиред, масалан `https://nurov-marketplace.onrender.com`.
8. `FRONTEND_URL`-ро ҳамин URL кунед → **Save** → як бор Restart.

Санҷиш: `https://....onrender.com/api/health`

Агар корт пурсад — Render ҳам мисли Railway пулакӣ шудааст. Он гоҳ роҳи 2.

---

## Роҳи 2 — VPS як контейнер (боэътимод)

Ягон VPS бо Ubuntu (Timeweb, Hetzner, FirstVDS, ~$5/моҳ).

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo git clone https://github.com/nurov-web/marketplyser.git /opt/nurov
cd /opt/nurov
```

Файл `.env`:

```
DATABASE_URL=postgresql://...neon...sslmode=require
DIRECT_URL=postgresql://...neon...sslmode=require
JWT_ACCESS_SECRET=b7340078817a4a9c4457c1db0fe4c6b8627e021d750f9140a8d3203dcdc93cb7
JWT_REFRESH_SECRET=c6220e71dedd4c741645ad275f95c24cce3154add184ea11b6b7479320db9ad9
FRONTEND_URL=http://IP-И-СЕРВЕР:3000
COOKIE_SAMESITE=lax
```

```bash
sudo docker compose -f docker-compose.prod.yml up -d --build
```

Сайт: `http://IP:3000`

---

Агар база холӣ бошад, аккаунтҳои demo сохта мешаванд:

- `admin@nurov.tj` / `Admin123!`
- `seller@nurov.tj` / `Seller123!`
- `user@nurov.tj` / `User123!`
