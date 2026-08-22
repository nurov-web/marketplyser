import { Response } from "express";
import { config } from "../config";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
  path: "/",
};

export function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie("accessToken", access, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie("refreshToken", refresh, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}
