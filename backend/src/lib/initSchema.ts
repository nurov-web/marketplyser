import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

function loadSql() {
  const candidates = [
    path.join(__dirname, "init.sql"),
    path.join(process.cwd(), "prisma", "migrations", "20260822000000_init_postgres", "migration.sql"),
    path.join(__dirname, "..", "..", "prisma", "migrations", "20260822000000_init_postgres", "migration.sql"),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  }
  return "";
}

function splitSql(sql: string) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((part) =>
      part
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(Boolean);
}

async function userTableExists() {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'User'
    ) AS exists
  `;
  return Boolean(rows[0]?.exists);
}

export async function ensureSchema() {
  if (await userTableExists()) return;

  const sql = loadSql();
  if (!sql) {
    throw new Error("migration.sql ёфт нашуд — Prisma schema-ро дар Vercel бандл кунед");
  }

  for (const stmt of splitSql(sql)) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/already exists/i.test(message)) continue;
      throw err;
    }
  }
}
