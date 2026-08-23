import Redis from "ioredis";
import { config } from "../config";

type MemoryStore = Map<string, { value: string; expiresAt: number }>;

const memory: MemoryStore = new Map();

function memoryGet(key: string): string | null {
  const row = memory.get(key);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    memory.delete(key);
    return null;
  }
  return row.value;
}

function memorySet(key: string, value: string, ttlSec: number) {
  memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

function memoryDel(key: string) {
  memory.delete(key);
}

let redis: Redis | null = null;
let redisReady = false;

if (config.redisUrl) {
  try {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 600,
    });
    redis.on("error", () => {
      redisReady = false;
    });
    redis
      .connect()
      .then(() => {
        redisReady = true;
      })
      .catch(() => {
        redisReady = false;
      });
  } catch {
    redis = null;
  }
}

export const cache = {
  async get(key: string): Promise<string | null> {
    if (redis && redisReady) {
      try {
        return await redis.get(key);
      } catch {
        return memoryGet(key);
      }
    }
    return memoryGet(key);
  },
  async set(key: string, value: string, ttlSec: number): Promise<void> {
    if (redis && redisReady) {
      try {
        await redis.set(key, value, "EX", ttlSec);
        return;
      } catch {
        /* fallback */
      }
    }
    memorySet(key, value, ttlSec);
  },
  async del(key: string): Promise<void> {
    if (redis && redisReady) {
      try {
        await redis.del(key);
        return;
      } catch {
        /* fallback */
      }
    }
    memoryDel(key);
  },
  async incr(key: string, ttlSec: number): Promise<number> {
    if (redis && redisReady) {
      try {
        const n = await redis.incr(key);
        if (n === 1) await redis.expire(key, ttlSec);
        return n;
      } catch {
        /* fallback */
      }
    }
    const current = Number(memoryGet(key) || "0") + 1;
    memorySet(key, String(current), ttlSec);
    return current;
  },
};
