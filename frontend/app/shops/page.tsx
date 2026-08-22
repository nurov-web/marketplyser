"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Store } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

type Shop = { id: string; shopName: string; logo: string | null; description: string; address: string };

export default function ShopsPage() {
  const [items, setItems] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: Shop[] }>("/api/sellers")
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-n py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Дӯконҳо</h1>
        {!loading && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold tabular-nums text-ink">{items.length}</span> дӯкон
          </p>
        )}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="skeleton mt-4 h-10" />
            </div>
          ))}
        </div>
      ) : items.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((s) => (
            <Link
              key={s.id}
              href={`/shop/${s.id}`}
              className="rounded-2xl border border-border bg-white p-5 shadow-soft motion-reduce:transition-none motion-safe:transition-[transform,opacity] motion-safe:duration-200 hover:-translate-y-1 hover:shadow-card motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-center gap-3">
                {s.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(s.logo)} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon icon={Store} className="h-6 w-6" aria-hidden />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{s.shopName}</p>
                  {s.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon icon={MapPin} className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{s.address}</span>
                    </p>
                  )}
                </div>
              </div>
              {s.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{s.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Icon icon={Store} className="h-10 w-10 text-primary" aria-hidden />
          </div>
          <h2 className="mt-5 text-lg font-bold text-ink">Дӯконҳо ҳанӯз нестанд</h2>
          <p className="mt-2 text-sm text-muted-foreground">Фурӯшандагон ба наздикӣ пайдо мешаванд.</p>
          <Link href="/search" className="btn-primary mt-6">
            Ба каталог
          </Link>
        </div>
      )}
    </div>
  );
}
