import { spawn, spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = join(root, "backend");
const frontendDir = join(root, "frontend");

const publicPort = process.env.PORT || "3000";
const backendPort = process.env.BACKEND_PORT || "4000";
const apiInternal = `http://127.0.0.1:${backendPort}`;

function run(cmd, args, cwd, extraEnv = {}) {
  const child = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    if (code && code !== 0) process.exit(code);
  });
  return child;
}

async function waitForHealth() {
  const url = `${apiInternal}/api/health`;
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // backend still starting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Backend healthcheck timeout");
}

const migrate = spawnSync(
  process.execPath,
  [join(backendDir, "node_modules/prisma/build/index.js"), "migrate", "deploy"],
  { cwd: backendDir, stdio: "inherit", env: process.env }
);
if (migrate.status !== 0) {
  console.error("prisma migrate deploy failed");
  process.exit(migrate.status || 1);
}

const backend = run(process.execPath, ["dist/index.js"], backendDir, {
  PORT: backendPort,
  NODE_ENV: "production",
});

await waitForHealth();

const frontend = run(
  process.execPath,
  [join(frontendDir, "node_modules/next/dist/bin/next"), "start", "--hostname", "0.0.0.0", "--port", publicPort],
  frontendDir,
  {
    PORT: publicPort,
    API_INTERNAL_URL: apiInternal,
    NEXT_PUBLIC_API_URL: "",
    NODE_ENV: "production",
  }
);

function shutdown() {
  backend.kill("SIGTERM");
  frontend.kill("SIGTERM");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
