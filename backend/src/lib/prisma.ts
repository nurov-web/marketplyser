import { PrismaClient } from "@prisma/client";

function withTimeout(url: string) {
  if (!url || /connect_timeout=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=10`;
}

const databaseUrl = withTimeout(process.env.DATABASE_URL || "");

export const prisma = databaseUrl
  ? new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  : new PrismaClient();
