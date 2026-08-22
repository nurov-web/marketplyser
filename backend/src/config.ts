import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "7d",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  cookieSameSite: (process.env.COOKIE_SAMESITE || "lax").toLowerCase(),
  cloudinaryUrl: process.env.CLOUDINARY_URL || "",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  bitrixWebhook: process.env.BITRIX_WEBHOOK_URL || "",
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
