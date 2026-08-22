"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Row = {
  id: string;
  shopName: string;
  status: string;
  user: { firstName: string; lastName: string; email: string };
  _count: { products: number; orderItems: number };
};

export default function AdminSellers() {
  const [items, setItems] = useState<Row[]>([]);
  function load() {
    api<{ items: Row[] }>("/api/admin/sellers").then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function act(id: string, action: string) {
    const reason = prompt("Сабаб / шарҳ?") || action;
    await api(`/api/admin/sellers/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Sellers</h1>
      <div className="mt-4 space-y-3">
        {items.map((s) => (
          <article key={s.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="font-semibold">{s.shopName} · {s.status}</p>
            <p className="text-sm text-slate-500">{s.user.firstName} {s.user.lastName} · {s.user.email}</p>
            <p className="mt-1 text-xs">{s._count.products} маҳсулот · {s._count.orderItems} фармоиш</p>
            <div className="mt-3 flex gap-2 text-xs">
              <button className="btn-gold" onClick={() => act(s.id, "approve")}>Approve</button>
              <button className="btn-ghost" onClick={() => act(s.id, "reject")}>Reject</button>
              <button className="btn-ghost" onClick={() => act(s.id, "block")}>Block</button>
              <button className="btn-ghost" onClick={() => act(s.id, "unblock")}>Unblock</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
