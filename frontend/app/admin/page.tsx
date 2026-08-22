"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Package, ShoppingBag, Store, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { StrokeText } from "@/components/motion/StrokeText";

type Dash = {
  users: number;
  sellers: number;
  products: number;
  orders: number;
  pendingSellers: number;
  pendingProducts: number;
  recentOrders: { id: string; number: number; status: string; total: number }[];
};

const cards = [
  { key: "users", label: "Users", href: "/admin/users", icon: Users, tone: "bg-blue-50 text-primary" },
  { key: "sellers", label: "Sellers", href: "/admin/sellers", icon: Store, tone: "bg-sky-50 text-sky-700" },
  { key: "products", label: "Products", href: "/admin/products", icon: Package, tone: "bg-violet-50 text-violet-700" },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingBag, tone: "bg-amber-50 text-amber-700" },
  { key: "pendingSellers", label: "Seller pending", href: "/admin/sellers", icon: Clock, tone: "bg-orange-50 text-orange-700" },
  { key: "pendingProducts", label: "Product pending", href: "/admin/products", icon: Clock, tone: "bg-rose-50 text-rose-700" },
] as const;

export default function AdminHome() {
  const [d, setD] = useState<Dash | null>(null);
  useEffect(() => {
    api<Dash>("/api/admin/dashboard").then(setD).catch(() => {});
  }, []);
  if (!d) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Control</p>
      <h1 className="mt-1 text-3xl text-ink sm:text-4xl">
        <StrokeText text="Dashboard" />
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">Омори бозор, тасдиқҳо ва фармоишҳои навтарин.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.key} href={c.href} className="card-n group p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}>
              <Icon icon={c.icon} className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{d[c.key]}</p>
          </Link>
        ))}
      </div>

      {d.recentOrders?.length > 0 && (
        <section className="card-n mt-8 overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold">Фармоишҳои нав</h2>
          </div>
          <ul>
            {d.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-border px-5 py-3 text-sm last:border-0">
                <span className="font-semibold">#{o.number}</span>
                <span className="text-muted-foreground">{o.status}</span>
                <span className="tabular-nums font-semibold">{o.total.toLocaleString()} TJS</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
