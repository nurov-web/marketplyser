import express, { NextFunction, Request, Response } from "express";

function bootError(err: unknown) {
  const app = express();
  app.use(express.json());
  const message = err instanceof Error ? err.stack || err.message : String(err);
  console.error("API boot failed:", message);
  app.use((req: Request, res: Response, _next: NextFunction) => {
    if (req.path === "/api/health") {
      return res.json({ ok: false, name: "Nurov Marketplace API", error: message.slice(0, 800) });
    }
    return res.status(500).json({ message: message.slice(0, 400) });
  });
  return app;
}

let app: express.Express;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  app = require("./app").createApp();
} catch (err) {
  app = bootError(err);
}

export default app;

if (!process.env.VERCEL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./listen").startLocal(app);
}
