# Nurov Marketplace

Платформаи харидуфурӯш бо се нақш: **User**, **Seller**, **Admin**.

## Стек

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, TypeScript, JWT, Socket.io
- Database: PostgreSQL (Neon дар production, Docker ё Neon дар локалӣ) + Prisma
- Redis: rate limit (бо fallback дар хотира)
- Расмҳо: `uploads/` локалӣ ё Cloudinary

## Оғоз

### 1. Backend

PostgreSQL лозим аст. Роҳи осон: `docker compose up -d postgres`. Ё URL-и Neon-ро ба `DATABASE_URL` ва `DIRECT_URL` гузоред.

```bash
cd backend
# .env-ро аз .env.example нусха кунед
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

API: http://localhost:4000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:3000

## Аккаунтҳои demo

| Нақш   | Email             | Парол      |
|--------|-------------------|------------|
| Admin  | admin@nurov.tj    | Admin123!  |
| Seller | seller@nurov.tj   | Seller123! |
| User   | user@nurov.tj     | User123!   |

## Маршрутҳо

- User: `/` `/search` `/product/:id` `/cart` `/checkout` `/orders` `/favorites` `/profile` `/chat` `/rules`
- Seller: `/seller`
- Admin: `/admin`

## Пардохт

Cash on Delivery пурра кор мекунад. Card / Online — sandbox (бе пардохти ҳақиқӣ).

## Deploy

**Тавсия ҳозир:** як сервер (frontend + backend), база Neon. Дастур: **[DEPLOY-ONE-SERVER.md](./DEPLOY-ONE-SERVER.md)**

Алоҳида ҳам мумкин: **[DEPLOY.md](./DEPLOY.md)** — Vercel + Railway + Neon.
