import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

let full: express.Express | null = null;
let loadError: string | null = null;
let initPromise: Promise<void> | null = null;

async function ensureReady() {
  if (full) return;
  if (loadError) throw new Error(loadError);
  if (!initPromise) {
    initPromise = (async () => {
      const mod = await import("./app");
      full = mod.createApp();
      const { ensureSchema } = await import("./lib/initSchema");
      const { ensureBootstrapUsers } = await import("./bootstrap");
      await ensureSchema();
      await ensureBootstrapUsers();
      const { ensureCatalog } = await import("./catalog");
      await ensureCatalog();
    })().catch((err) => {
      loadError = err instanceof Error ? err.stack || err.message : String(err);
      console.error("API init failed:", loadError);
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
}

if (process.env.VERCEL) {
  void ensureReady().catch(() => {});
}

app.get("/api/health", async (_req, res) => {
  let ready = Boolean(full);
  if (!ready && !loadError) {
    try {
      await ensureReady();
      ready = true;
    } catch {
      ready = false;
    }
  }
  res.json({
    ok: ready && !loadError,
    name: "Nurov Marketplace API",
    backend: true,
    ready,
    error: loadError ? loadError.slice(0, 200) : undefined,
  });
});

app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();

  try {
    await ensureReady();
  } catch {
    return res.status(500).json({ message: loadError || "Backend load failed" });
  }

  if (!full) {
    return res.status(500).json({ message: loadError || "Backend load failed" });
  }

  return full(req, res, next);
});

export default app;

if (!process.env.VERCEL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./listen").startLocal(app);
}
