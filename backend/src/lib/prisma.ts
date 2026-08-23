import { PrismaClient } from "@prisma/client";

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

function withTimeout(url: string) {
  if (!url || /connect_timeout=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=10`;
}

let client: PrismaClient | null = null;

function createClient() {
  const url = withTimeout(process.env.DATABASE_URL || "");
  if (!url) {
    throw new Error("DATABASE_URL дар Vercel гузошта нашудааст");
  }
  return new PrismaClient({
    datasources: { db: { url } },
  });
}

export function getPrisma() {
  if (!client) client = createClient();
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPrisma(), prop, receiver);
    return typeof value === "function" ? value.bind(getPrisma()) : value;
  },
});
