import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    name: "Nurov Marketplace API",
    backend: true,
  });
});

let full: express.Express | null = null;
let loadError: string | null = null;

app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();

  if (!full && !loadError) {
    try {
      const mod = await import("./app");
      full = mod.createApp();
      const { ensureBootstrapUsers } = await import("./bootstrap");
      void ensureBootstrapUsers().catch((e) => console.error("bootstrap failed", e));
    } catch (err) {
      loadError = err instanceof Error ? err.stack || err.message : String(err);
      console.error("full API load failed:", loadError);
    }
  }

  if (loadError || !full) {
    return res.status(500).json({
      message: loadError || "Backend load failed",
    });
  }

  return full(req, res, next);
});

export default app;

if (!process.env.VERCEL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./listen").startLocal(app);
}
