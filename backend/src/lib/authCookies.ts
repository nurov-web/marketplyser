import { CookieOptions, Response } from "express";
import { config } from "../config";

function cookieOpts(): CookieOptions {
  const crossSite = config.cookieSameSite === "none";
  return {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: config.nodeEnv === "production" || crossSite,
    path: "/",
  };
}

export function setAuthCookies(res: Response, access: string, refresh: string) {
  const opts = cookieOpts();
  res.cookie("accessToken", access, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie("refreshToken", refresh, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  const opts = cookieOpts();
  res.clearCookie("accessToken", opts);
  res.clearCookie("refreshToken", opts);
}
