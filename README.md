# Nurov Marketplace

Платформаи харидуфурӯш бо се нақш: **User**, **Seller**, **Admin**.

## Стек

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, TypeScript, JWT, Socket.io
- Database: SQLite (локалӣ) / PostgreSQL (production) + Prisma
- Redis: rate limit (бо fallback дар хотира)
- Расмҳо: `uploads/` локалӣ ё Cloudinary

## Оғоз

### 1. Backend

Барои development SQLite истифода мешавад (бе Docker). `docker-compose.yml` барои PostgreSQL/Redis низ ҳаст.

```bash
cd backend
npm install
npx prisma migrate dev --name init
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

- Frontend: Vercel (`NEXT_PUBLIC_API_URL` ба URL-и backend)
- Backend: Render/Railway (`DATABASE_URL`, `JWT_*`, `FRONTEND_URL`)
- Database: PostgreSQL managed
