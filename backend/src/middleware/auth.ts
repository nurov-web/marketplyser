import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../lib/jwt";
import { cache } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { setAuthCookies } from "../lib/authCookies";

export type AuthedRequest = Request & {
  user?: { id: string; role: Role };
};

async function loadActiveUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, accountStatus: true },
  });
  if (!user) return null;
  if (user.accountStatus === "BANNED" || user.accountStatus === "SUSPENDED") return user;
  return user;
}

async function refreshSession(req: AuthedRequest, res: Response) {
  const refresh = req.cookies?.refreshToken;
  if (!refresh) return null;
  const payload = verifyRefreshToken(refresh);
  const user = await loadActiveUser(payload.userId);
  if (!user || user.accountStatus === "BANNED" || user.accountStatus === "SUSPENDED") return user;
  const next = { userId: user.id, role: user.role };
  setAuthCookies(res, signAccessToken(next), signRefreshToken(next));
  return user;
}

export async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token =
      (header?.startsWith("Bearer ") ? header.slice(7) : null) ||
      req.cookies?.accessToken;

    if (token) {
      const blacklisted = await cache.get(`bl:${token}`);
      if (blacklisted) {
        return res.status(401).json({ message: "Сессия бекор карда шуд" });
      }
      try {
        const payload = verifyAccessToken(token);
        const user = await loadActiveUser(payload.userId);
        if (!user) return res.status(401).json({ message: "Корбар ёфт нашуд" });
        if (user.accountStatus === "BANNED" || user.accountStatus === "SUSPENDED") {
          return res.status(403).json({
            message: "Аккаунт маҳдуд аст",
            accountStatus: user.accountStatus,
          });
        }
        req.user = { id: user.id, role: user.role };
        return next();
      } catch {
        /* try refresh below */
      }
    }

    try {
      const user = await refreshSession(req, res);
      if (!user) return res.status(401).json({ message: "Аввал ворид шавед" });
      if (user.accountStatus === "BANNED" || user.accountStatus === "SUSPENDED") {
        return res.status(403).json({
          message: "Аккаунт маҳдуд аст",
          accountStatus: user.accountStatus,
        });
      }
      req.user = { id: user.id, role: user.role };
      return next();
    } catch {
      return res.status(401).json({ message: "Токен нодуруст ё мӯҳлаташ гузаштааст" });
    }
  } catch {
    return res.status(401).json({ message: "Токен нодуруст ё мӯҳлаташ гузаштааст" });
  }
}

/** Like authenticate, but guests continue without 401. */
export async function softAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token =
      (header?.startsWith("Bearer ") ? header.slice(7) : null) ||
      req.cookies?.accessToken;

    if (token) {
      const blacklisted = await cache.get(`bl:${token}`);
      if (!blacklisted) {
        try {
          const payload = verifyAccessToken(token);
          const user = await loadActiveUser(payload.userId);
          if (user && user.accountStatus !== "BANNED" && user.accountStatus !== "SUSPENDED") {
            req.user = { id: user.id, role: user.role };
            return next();
          }
        } catch {
          /* try refresh */
        }
      }
    }

    try {
      const user = await refreshSession(req, res);
      if (user && user.accountStatus !== "BANNED" && user.accountStatus !== "SUSPENDED") {
        req.user = { id: user.id, role: user.role };
      }
    } catch {
      /* guest */
    }
    return next();
  } catch {
    return next();
  }
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    (header?.startsWith("Bearer ") ? header.slice(7) : null) ||
    req.cookies?.accessToken;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
  } catch {
    /* ignore */
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Аввал ворид шавед" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Дастрасӣ манъ аст" });
    }
    next();
  };
}
