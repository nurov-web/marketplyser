const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parseBody(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 180) };
  }
}

async function rawFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const method = (init.method || "GET").toUpperCase();
  const retries = method === "GET" ? 2 : 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        ...init,
        headers,
        credentials: "include",
      });
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      return res;
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw new ApiError(0, "Пайвастшавӣ нест. Боз санҷед.");
    }
  }
  throw new ApiError(0, "Пайвастшавӣ нест. Боз санҷед.");
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh() {
  if (!refreshing) {
    refreshing = rawFetch("/api/auth/refresh", { method: "POST" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await rawFetch(path, init);
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    const ok = await tryRefresh();
    if (ok) res = await rawFetch(path, init);
  }
  const data = parseBody(await res.text());
  if (!res.ok) {
    throw new ApiError(res.status, data?.message || "Хато рух дод");
  }
  return data as T;
}

const inflight = new Map<string, Promise<unknown>>();

export function getOnce<T>(path: string): Promise<T> {
  const existing = inflight.get(path);
  if (existing) return existing as Promise<T>;
  const p = api<T>(path);
  inflight.set(path, p);
  p.finally(() => {
    setTimeout(() => {
      if (inflight.get(path) === p) inflight.delete(path);
    }, 60_000);
  });
  return p;
}

export function mediaUrl(url?: string | null, _size: "sm" | "lg" = "sm") {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API}${url}`;
}

export function money(n: number | string | undefined | null) {
  const v = Number(n || 0);
  return `${v.toLocaleString("ru-RU")} с.`;
}
