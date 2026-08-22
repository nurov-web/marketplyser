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
  cloudinaryUrl: process.env.CLOUDINARY_URL || "",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  bitrixWebhook: process.env.BITRIX_WEBHOOK_URL || "",
};
