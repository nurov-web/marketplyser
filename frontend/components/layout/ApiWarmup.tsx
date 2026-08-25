"use client";

import { useEffect } from "react";
import { getOnce } from "@/lib/api";

/** Дар телефон API-ро зуд омода мекунад (cold start Vercel). */
export function ApiWarmup() {
  useEffect(() => {
    void getOnce("/api/health").catch(() => {});
  }, []);
  return null;
}
