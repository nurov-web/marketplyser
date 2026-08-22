"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Row = {
  id: string;
  rating: number;
  comment: string;
  user: { firstName: string; lastName: string };
  product: { name: string };
};

export default function AdminReviews() {
  const [items, setItems] = useState<Row[]>([]);
  function load() {
    api<{ items: Row[] }>("/api/admin/reviews").then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="mt-4 space-y-3">
        {items.map((r) => (
          <article key={r.id} className="rounded-2xl bg-white p-4 shadow-soft">
            <p className="text-sm font-medium">{r.product.name} · {r.rating}★ · {r.user.firstName}</p>
            <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
            <button
              className="mt-2 text-xs text-red-600"
              onClick={async () => {
                await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
                load();
              }}
            >
              Хориҷ кардан
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
