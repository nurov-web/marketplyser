# Deploy: ҳар ду дар Vercel (frontend + backend)

Сайт ва API дар **як лоиҳаи Vercel** мешаванд, як URL:
`https://marketplyser.vercel.app` — саҳифаҳо, `/api` — backend.

База: **Neon**. Расмҳо: **Cloudinary** (тавсия).

Файлҳои лозим аллакай ҳастанд: `vercel.json` дар решаи репо.

---

## 1. Neon-ро фаъол кунед

1. [console.neon.tech](https://console.neon.tech) → лоиҳа → **Resume** агар хоб бошад.
2. Connection strings:
   - **Pooled** → `DATABASE_URL` (`?sslmode=require`, **бе** `supavisor_session=true`)
   - **Direct** (unpooled) → `DIRECT_URL`
3. Агар як URL доред, ҳамонро ба ҳар ду гузоред.

---

## 2. Лоиҳаи Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → репои `marketplyser`.
2. **Root Directory:** холӣ / `.` / `./`  
   **На** `frontend`. Агар `frontend` бошад, backend умуман билд намешавад.
3. **Framework Preset:** **Services** (на Next.js).
4. `vercel.json` аз Git худ хонда мешавад. Override накунед.

---

## 3. Environment Variables

Дар Vercel → Settings → Environment Variables. Ба **Production** (ва Preview) гузоред.

| Key | Қимат |
|-----|--------|
| `DATABASE_URL` | Neon pooled |
| `DIRECT_URL` | Neon direct |
| `NODE_ENV` | `production` |
| `JWT_ACCESS_SECRET` | ≥32 аломат (тасодуфӣ) |
| `JWT_REFRESH_SECRET` | калиди **дигар**, ≥32 аломат |
| `FRONTEND_URL` | `https://marketplyser.vercel.app` (URL-и ҳамин лоиҳа) |
| `COOKIE_SAMESITE` | `lax` |
| `NEXT_PUBLIC_API_URL` | **холӣ** (ҳеҷ чиз) |
| `API_INTERNAL_URL` | **холӣ** (ҳеҷ чиз) |
| `CLOUDINARY_URL` | ихтиёрӣ, тавсия |

**Нагузоред:** номи URL-ро ҳамчун Key (`https://...` дар сутуни Key хато аст).

Калидҳои JWT (дар компютери худ):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ду бор иҷро кунед — як барои ACCESS, як барои REFRESH.

Пас аз гузоштани URL-и Vercel ба `FRONTEND_URL`, як бор **Redeploy** кунед.

---

## 4. Deploy

**Deploy** пахш кунед. Vercel ду сервис месозад:

- `frontend` → Next.js (`frontend/`)
- `backend` → Express (`backend/src/index.ts`)

Маршрутҳо:

| URL | Куҷо меравад |
|-----|----------------|
| `/` `/search` `/admin` | frontend |
| `/api/...` | backend |
| `/uploads/...` | backend |

Санҷиш: `https://YOUR-APP.vercel.app/api/health`  
Бояд: `{"ok":true,"name":"Nurov Marketplace API"}`

Агар база холӣ бошад, demo:

- `admin@nurov.tj` / `Admin123!`
- `user@nurov.tj` / `User123!`

Паролҳоро дар production иваз кунед.

---

## Хатоҳои маъмул

| Мушкил | Ҳал |
|--------|-----|
| `DEPLOYMENT_NOT_FOUND` / танҳо frontend | Root Directory = `.`, Framework = **Services** |
| `/api` 404 | `vercel.json` дар решаи репо бошад; `/api` rewrite ба backend |
| Login / cookie нест | `NEXT_PUBLIC_API_URL` ва `API_INTERNAL_URL` холӣ |
| Prisma / migrate failed | Neon Resume; `DIRECT_URL` = unpooled; `DATABASE_URL` бе `supavisor_session=true` |
| JWT error | секретҳо ≥32 аломат, на `change-me` |
| Расмҳо нест мешаванд | `CLOUDINARY_URL` — диски Vercel пойдор нест |
| Чат realtime | Socket.io дар Vercel Functions маҳдуд аст |

---

## Алоҳида (ихтиёрӣ)

Агар Services дастрас набошад: frontend дар Vercel (`Root: frontend`) ва backend дар Railway. Он гоҳ `API_INTERNAL_URL` = URL-и Railway, `NEXT_PUBLIC_API_URL` ҳанӯз холӣ.
