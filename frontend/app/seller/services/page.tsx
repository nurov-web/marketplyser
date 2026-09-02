"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Request = {
  id: string;
  customerName: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  provider: { name: string };
};

const STATUS: Record<string, string> = {
  NEW: "Нав",
  CONFIRMED: "Тасдиқ",
  COMPLETED: "Анҷом",
  CANCELLED: "Бекор",
};

export default function SellerServicesPage() {
  const [items, setItems] = useState<Request[]>([]);

  useEffect(() => {
    api<{ items: Request[] }>("/api/services/seller/requests")
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Фармоишҳои хизмат</h1>
      <p className="mt-1 text-sm text-muted-foreground">Megasavdo — фармоишҳо барои хизматҳои шумо</p>

      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Ҳанӯз фармоиш нест</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-white shadow-soft">
          {items.map((r) => (
            <li key={r.id} className="px-4 py-4">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">{r.customerName}</p>
                  <p className="text-sm text-muted-foreground">{r.phone}</p>
                  {r.message && <p className="mt-1 text-sm">{r.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {STATUS[r.status] || r.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
