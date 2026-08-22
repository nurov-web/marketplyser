import { NextFunction, Request, Response } from "express";
import { cache } from "../lib/redis";

export function rateLimit({ windowSec = 60, max = 60, prefix = "rl" } = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${prefix}:${ip}:${req.path}`;
    const count = await cache.incr(key, windowSec);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));
    if (count > max) {
      return res.status(429).json({ message: "Дархостҳо зиёд шуданд. Каме интизор шавед." });
    }
    next();
  };
}
