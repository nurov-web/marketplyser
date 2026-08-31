import dotenv from "dotenv";
dotenv.config();

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const DEFAULT_SUPABASE_URL = "https://jnsndodhnlxmiynuwvwv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_jB9eNZQWvEsLNBiV8gf37g_J3Uj3k3z";

function resolveFrontendUrl() {
  if (process.env.FRONTEND_URL?.trim()) return process.env.FRONTEND_URL.trim();
  if (process.env.VERCEL_URL?.trim()) return `https://${process.env.VERCEL_URL.trim()}`;
  return "http://localhost:3000";
}

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "7d",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  frontendUrl: resolveFrontendUrl(),
  cookieSameSite: (process.env.COOKIE_SAMESITE || "lax").toLowerCase(),
  cloudinaryUrl: process.env.CLOUDINARY_URL || "",
  uploadDir: process.env.UPLOAD_DIR || (process.env.VERCEL ? "/tmp/uploads" : "uploads"),
  bitrixWebhook: process.env.BITRIX_WEBHOOK_URL || "",
  supabaseUrl:
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL,
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY,
};

export function assertProductionSecrets() {
  if (config.nodeEnv !== "production") return;
  const weak = (s: string) =>
    !s || s.length < 32 || s.startsWith("dev-") || s.includes("change-me");
  if (weak(config.jwtAccessSecret) || weak(config.jwtRefreshSecret)) {
    throw new Error("JWT_ACCESS_SECRET ва JWT_REFRESH_SECRET бояд ҳадди ақал 32 аломат бошанд.");
  }
  if (!/^postgres(ql)?:\/\//i.test(config.databaseUrl)) {
    throw new Error("DATABASE_URL бояд PostgreSQL бошад (Neon).");
  }
}
