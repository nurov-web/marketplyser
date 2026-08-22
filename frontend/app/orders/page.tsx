"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Package } from "lucide-react";
import { api, money } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const colors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-amber-100 text-amber-900",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Дар интизор",
  CONFIRMED: "Тасдиқшуда",
  PROCESSING: "Коркард",
  SHIPPED: "Фиристода шуд",
  DELIVERED: "Расонида шуд",
  CANCELLED: "Бекор шуд",
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      api<{ items: Order[] }>("/api/orders")
        .then((d) => setItems(d.items))
        .catch(() => setItems([]))
        .finally(() => setReady(true));
    }
  }, [user, loading, router]);

  return (
    <div className="container-n py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Фармоишҳо</h1>
          {ready && items.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-ink">{items.length}</span> фармоиш
            </p>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {!ready && (
            <>
              <div className="skeleton h-28" />
              <div className="skeleton h-28" />
            </>
          )}
          {items.map((o) => {
            const status = o.status;
            const date = o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
              : "";
            return (
              <article key={o.id} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">Фармоиш №{o.number}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status]}`}>{labels[status]}</span>
                </div>
                {date && <p className="mt-1 text-xs text-muted-foreground">{date}</p>}
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{o.items.map((i) => i.name).join(", ")}</p>
                <p className="mt-2 font-bold tabular-nums">{money(o.total)}</p>
                <Link href={`/orders/${o.id}`} className="btn-ghost mt-3">
                  Дидани фармоиш
                  <Icon icon={ChevronRight} className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            );
          })}
          {ready && !items.length && (
            <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                <Icon icon={Package} className="h-10 w-10 text-primary" aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-bold text-ink">Фармоиш нест</h2>
              <p className="mt-2 text-sm text-muted-foreground">Пас аз харид фармоишҳои шумо инҷо пайдо мешаванд.</p>
              <Link href="/search" className="btn-primary mt-6">
                Ба каталог
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
