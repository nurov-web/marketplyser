"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastItem = { id: number; text: string; type: "ok" | "err" };

let push: ((text: string, type?: "ok" | "err") => void) | null = null;

export function toast(text: string, type: "ok" | "err" = "ok") {
  push?.(text, type);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    push = (text, type = "ok") => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list.slice(-3), { id, text, type }]);
      setTimeout(() => setItems((list) => list.filter((i) => i.id !== id)), 3200);
    };
    return () => {
      push = null;
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2 md:bottom-6">
      {items.map((i) => (
        <div
          key={i.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lift ${
            i.type === "ok" ? "bg-primary" : "bg-red-600"
          }`}
        >
          {i.type === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {i.text}
        </div>
      ))}
    </div>
  );
}
