"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Package, Plus, ShoppingBag, Store, Truck, Users } from "lucide-react";
import { api, money } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { AdminCard, AdminPageHeader, StatCard, StatusBadge } from "@/components/admin/ui";

type Dash = {
  users: number;
  sellers: number;
  products: number;
  orders: number;
  pendingSellers: number;
  pendingProducts: number;
  pendingCouriers: number;
  recentOrders: { id: string; number: number; status: string; total: number }[];
};

export default function AdminHome() {
  const [d, setD] = useState<Dash | null>(null);
  useEffect(() => {
    api<Dash>("/api/admin/dashboard").then(setD).catch(() => {});
  }, []);

  if (!d) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Омори умумӣ"
        description="Хулосаи сайт: молҳо, фармоишҳо, корбарон. Аз ин ҷо идора кунед."
        actions={
          <>
            <Link href="/admin/products/new" className="btn-primary min-h-11">
              <Icon icon={Plus} className="h-4 w-4" aria-hidden />
              Моли нав
            </Link>
            <Link href="/admin/categories" className="btn-ghost min-h-11">
              Категорияҳо
            </Link>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard href="/admin/products" label="Молҳо" value={d.products} icon={Package} tone="bg-violet-50 text-violet-700" />
        <StatCard href="/admin/orders" label="Фармоишҳо" value={d.orders} icon={ShoppingBag} tone="bg-amber-50 text-amber-700" />
        <StatCard href="/admin/users" label="Корбарон" value={d.users} icon={Users} tone="bg-blue-50 text-primary" />
        <StatCard href="/admin/sellers" label="Фурӯшандагон" value={d.sellers} icon={Store} tone="bg-sky-50 text-sky-700" />
        <StatCard href="/admin/sellers" label="Seller интизор" value={d.pendingSellers} icon={Clock} tone="bg-orange-50 text-orange-700" />
        <StatCard href="/admin/couriers" label="Доставчик интизор" value={d.pendingCouriers} icon={Truck} tone="bg-teal-50 text-teal-700" />
        <StatCard href="/admin/products" label="Мол интизор" value={d.pendingProducts} icon={Clock} tone="bg-rose-50 text-rose-700" />
      </div>

      {d.recentOrders?.length > 0 && (
        <AdminCard className="mt-8 overflow-hidden p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold text-ink">Фармоишҳои нав</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Охирин фармоишҳо дар система</p>
          </div>
          <ul className="divide-y divide-border">
            {d.recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                <span className="font-semibold tabular-nums">#{o.number}</span>
                <StatusBadge status={o.status} />
                <span className="font-semibold tabular-nums text-ink">{money(o.total)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-5 py-3">
            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
              Ҳамаи фармоишҳо →
            </Link>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
