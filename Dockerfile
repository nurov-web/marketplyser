FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/prisma ./backend/prisma
COPY frontend/package.json frontend/package-lock.json ./frontend/

WORKDIR /app/backend
RUN npm install --ignore-scripts

WORKDIR /app/frontend
RUN npm install

WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
COPY scripts ./scripts

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=""
ENV API_INTERNAL_URL="http://127.0.0.1:4000"
ENV DATABASE_URL="postgresql://nurov:nurov@127.0.0.1:5432/nurov_marketplace"
ENV DIRECT_URL="postgresql://nurov:nurov@127.0.0.1:5432/nurov_marketplace"

WORKDIR /app/backend
RUN npx prisma generate && npx tsc

WORKDIR /app/frontend
ENV NODE_ENV=production
RUN npm run build

WORKDIR /app
ENV PORT=3000
EXPOSE 3000

CMD ["node", "scripts/start-all.mjs"]
