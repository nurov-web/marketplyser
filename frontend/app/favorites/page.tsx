"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<{ product: Product }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      api<{ items: { product: Product }[] }>("/api/favorites")
        .then((d) => setItems(d.items))
        .catch(() => setItems([]))
        .finally(() => setReady(true));
    }
  }, [user, loading, router]);

  return (
    <div className="container-n py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Дӯстдоштаҳо</h1>
        {ready && items.length > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-ink">{items.length}</span> маҳсулот
          </p>
        )}
      </div>

      {!ready ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
              <div className="skeleton aspect-square rounded-none" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {items.map((i) => (
            <ProductCard key={i.product.id} product={i.product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Icon icon={Heart} className="h-10 w-10 text-primary" aria-hidden />
          </div>
          <h2 className="mt-5 text-lg font-bold text-ink">Рӯйхат холӣ аст</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Маҳсулоти дӯстдоштаро инҷо нигоҳ доред — аз каталог қалбчаро пахш кунед.
          </p>
          <Link href="/search" className="btn-primary mt-6">
            Ба каталог
          </Link>
        </div>
      )}
    </div>
  );
}
