# Deploy

Агар Railway/Vercel алоҳида нашавад, **як сервер** истифода баред: **[DEPLOY-ONE-SERVER.md](./DEPLOY-ONE-SERVER.md)** (frontend + backend якҷоя, база Neon).

---

# Deploy: Vercel + Railway + Neon

Лоиҳа барои production тайёр аст.

| Қисм | Хизмат | Root Directory |
|------|--------|----------------|
| Frontend | [Vercel](https://vercel.com) | `frontend` |
| Backend | [Railway](https://railway.app) | `backend` |
| Database | [Neon](https://neon.tech) PostgreSQL | — |
| Расмҳо | [Cloudinary](https://cloudinary.com) (тавсия) | — |

Cookie-ҳои login кор мекунанд, агар frontend аз **ҳамон домени Vercel** ба `/api` дархост фиристад (`NEXT_PUBLIC_API_URL` холи). Vercel онро ба Railway rewrite мекунад.

---

## 1. Neon

1. Лоиҳаи нав созед, PostgreSQL-ро гиред.
2. **Connection string**-ҳоро нусха кунед:
   - **Pooled** → `DATABASE_URL` (охираш `?sslmode=require`)
   - **Direct** (unpooled) → `DIRECT_URL` (барои `prisma migrate`)
3. Агар танҳо як URL доред, ҳамонро ба ҳар ду тағйирёбанда гузоред.

---

## 2. Railway (backend)

1. New Project → Deploy from GitHub → репозиторийи `marketplyser`.
2. **Root Directory:** `backend`
3. Variables:

| Ном | Мисол |
|-----|--------|
| `DATABASE_URL` | Neon pooled |
| `DIRECT_URL` | Neon direct |
| `NODE_ENV` | `production` |
| `JWT_ACCESS_SECRET` | калиди тасодуфӣ, ≥32 аломат |
| `JWT_REFRESH_SECRET` | калиди дигар, ≥32 аломат |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `COOKIE_SAMESITE` | `lax` |
| `CLOUDINARY_URL` | `cloudinary://...` (тавсия) |

`PORT`-ро Railway худаш мегузорад. Redis ихтиёрӣ аст.

4. Deploy. Healthcheck: `GET /api/health`
5. URL-и сервис, масалан `https://nurov-api.up.railway.app` — ин `API_INTERNAL_URL` дар Vercel аст.

Бори аввал, агар база холӣ бошад, аккаунтҳои demo сохта мешаванд:

- `admin@nurov.tj` / `Admin123!`
- `seller@nurov.tj` / `Seller123!`
- `user@nurov.tj` / `User123!`

Паролҳоро дар production иваз кунед. `npm run prisma:seed` дар сервер **надавед** — ҳамаи маълумотро нест мекунад.

---

## 3. Vercel (frontend)

1. Import GitHub repo.
2. **Root Directory:** `frontend`
3. Framework: Next.js (худ муайян мешавад).
4. Environment variables:

| Ном | Қимат |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | **холӣ гузоред** |
| `API_INTERNAL_URL` | `https://xxxx.up.railway.app` (бе `/` дар охир) |

5. Deploy. Баъд URL-и Vercel-ро ба `FRONTEND_URL` дар Railway гузоред ва backend-ро як бор Restart кунед.

Агар домени шахсӣ бандед (масалан `nurov.tj`), онро ҳам ба `FRONTEND_URL` илова кунед:

```
https://nurov.tj,https://www.nurov.tj,https://your-app.vercel.app
```

---

## 4. Расмҳо

Диски Railway муваққатӣ аст. Бе Cloudinary расмҳои боршуда пас аз restart гум мешаванд.

Дар Cloudinary Dashboard → API Environment variable → `CLOUDINARY_URL`-ро ба Railway гузоред.

---

## 5. Локалӣ пас аз ин тағйирот

SQLite дигар кор намекунад. PostgreSQL лозим аст:

```bash
docker compose up -d postgres
```

Дар `backend/.env`:

```
DATABASE_URL="postgresql://nurov:nurov@localhost:5432/nurov_marketplace"
DIRECT_URL="postgresql://nurov:nurov@localhost:5432/nurov_marketplace"
```

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Ё ҳамон URL-ҳои Neon-ро дар `.env` гузоред.

---

## Хатоҳои маъмул

| Мушкил | Ҳал |
|--------|-----|
| Login кор намекунад / cookie нест | `NEXT_PUBLIC_API_URL`-ро холӣ гузоред; `API_INTERNAL_URL` = Railway |
| CORS error | `FRONTEND_URL` бояд URL-и дақиқи Vercel бошад |
| Prisma migrate failed (pgbouncer) | `DIRECT_URL` = Neon **direct** (unpooled) |
| JWT error ҳангоми старт | секретҳо ≥32 аломат, на `change-me` |
| Расмҳо нест мешаванд | `CLOUDINARY_URL` гузоред |
