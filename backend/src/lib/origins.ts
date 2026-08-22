import { config } from "../config";

export function allowedOrigins(): string[] {
  return config.frontendUrl
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins().includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }
  return false;
}
