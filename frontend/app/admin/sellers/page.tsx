"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

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
  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: string) {
    const reason = prompt("Сабаб / шарҳ?") || action;
    await api(`/api/admin/sellers/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) });
    load();
  }

  return (
    <div>
      <AdminPageHeader title="Фурӯшандагон" description="Тасдиқ, рад ва блок кардани мағозаҳо." />

      <div className="mt-6 space-y-3">
        {items.map((s) => (
          <AdminCard key={s.id}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{s.shopName}</p>
              <StatusBadge status={s.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{s.user.firstName} {s.user.lastName} · {s.user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s._count.products} мол · {s._count.orderItems} фармоиш</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-primary min-h-9 px-3 text-xs" onClick={() => act(s.id, "approve")}>
                Тасдиқ
              </button>
              <button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={() => act(s.id, "reject")}>
                Рад
              </button>
              <button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={() => act(s.id, "block")}>
                Блок
              </button>
              <button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={() => act(s.id, "unblock")}>
                Озод
              </button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
