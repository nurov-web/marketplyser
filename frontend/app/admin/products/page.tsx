"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";

type Row = {
  id: string;
  name: string;
  price: number | string;
  moderationStatus: string;
  seller: { shopName: string };
};

export default function AdminProducts() {
  const [items, setItems] = useState<Row[]>([]);
  const [status, setStatus] = useState("PENDING");
  function load() {
    api<{ items: Row[] }>(`/api/admin/products?status=${status}`).then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, [status]);

  async function act(id: string, action: string) {
    const reason = action === "reject" ? prompt("Сабаб?") || "" : undefined;
    await api(`/api/admin/products/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Products moderation</h1>
      <select className="mt-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        {["PENDING", "APPROVED", "REJECTED", "HIDDEN"].map((s) => <option key={s}>{s}</option>)}
      </select>
      <div className="mt-4 space-y-3">
        {items.map((p) => (
          <article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-soft">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500">{p.seller.shopName} · {money(p.price)} · {p.moderationStatus}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="btn-gold" onClick={() => act(p.id, "approve")}>Approve</button>
              <button className="btn-ghost" onClick={() => act(p.id, "reject")}>Reject</button>
              <button className="btn-ghost" onClick={() => act(p.id, "hide")}>Hide</button>
              <button className="text-red-600" onClick={() => act(p.id, "delete")}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
