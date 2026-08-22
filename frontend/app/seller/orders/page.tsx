"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";

type Item = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  order: { number: number; phone: string; user: { firstName: string; lastName: string } };
};

const next = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function SellerOrders() {
  const [items, setItems] = useState<Item[]>([]);
  function load() {
    api<{ items: Item[] }>("/api/orders/seller/mine").then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    const reason = status === "CANCELLED" ? prompt("Сабаб?") || "" : undefined;
    await api(`/api/orders/items/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Фармоишҳо</h1>
      <div className="mt-6 space-y-3">
        {items.map((i) => (
          <article key={i.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="font-semibold">Order #{i.order.number}</p>
            <p className="text-sm text-slate-500">
              Customer: {i.order.user.firstName} {i.order.user.lastName} · {i.order.phone}
            </p>
            <p className="mt-2">{i.name} × {i.quantity} · {money(i.price)}</p>
            <p className="mt-1 text-xs">Status: {i.status}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {next.map((s) => (
                <button key={s} className="btn-ghost text-xs" onClick={() => setStatus(i.id, s)}>{s}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
