"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { AdminCard, AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/ui";
import type { Order } from "@/types";

export default function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: Order[] }>("/api/admin/orders")
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader title="Фармоишҳо" description="Рӯйхати ҳамаи фармоишҳо ва ҳолати онҳо." />

      {loading && <div className="mt-6 skeleton h-48 rounded-2xl" />}

      {!loading && !items.length && (
        <EmptyState className="mt-6" title="Фармоиш нест" hint="Вақте харидорон фармоиш диҳанд, ин ҷо пайдо мешавад." />
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border/80 bg-white shadow-soft md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4">Рақам</th>
                  <th className="p-4">Мизоҷ</th>
                  <th className="p-4">Ҳолат</th>
                  <th className="p-4 text-right">Ҷамъ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold tabular-nums">#{o.number}</td>
                    <td className="p-4">{o.fullName}</td>
                    <td className="p-4"><StatusBadge status={o.status} /></td>
                    <td className="p-4 text-right font-semibold tabular-nums">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 space-y-3 md:hidden">
            {items.map((o) => (
              <AdminCard key={o.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold tabular-nums">#{o.number}</span>
                <StatusBadge status={o.status} />
                <span className="text-sm text-muted-foreground">{o.fullName}</span>
                <span className="font-semibold tabular-nums">{money(o.total)}</span>
              </AdminCard>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
