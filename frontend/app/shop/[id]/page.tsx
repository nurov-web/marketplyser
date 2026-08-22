"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, PackageSearch, Store } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";

type Shop = {
  id: string;
  shopName: string;
  logo: string | null;
  description: string;
  address: string;
};

export default function ShopPage() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Shop | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ seller: Shop; items: Product[] }>(`/api/sellers/shop/${id}`)
      .then((d) => {
        setSeller(d.seller);
        setItems(d.items);
      })
      .catch(() => setError("Дӯкон ёфт нашуд"));
  }, [id]);

  if (error) {
    return (
      <div className="container-n py-16 text-center">
        <p className="text-lg font-semibold text-ink">{error}</p>
        <Link href="/shops" className="btn-primary mt-6">
          Ҳамаи дӯконҳо
        </Link>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container-n py-8">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <div className="skeleton h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-7 w-1/3" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
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
      </div>
    );
  }

  return (
    <div className="container-n py-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft sm:flex-row sm:items-center">
        {seller.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(seller.logo)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={Store} className="h-8 w-8" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{seller.shopName}</h1>
          {seller.address && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon icon={MapPin} className="h-4 w-4 shrink-0" aria-hidden />
              {seller.address}
            </p>
          )}
          {seller.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">{seller.description}</p>}
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-ink">{items.length}</span> маҳсулот
        </p>
      </div>

      {items.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight">Маҳсулоти дӯкон</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Icon icon={PackageSearch} className="h-10 w-10 text-primary" aria-hidden />
          </div>
          <h2 className="mt-5 text-lg font-bold text-ink">Ҳоло маҳсулот нест</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ин дӯкон ҳанӯз маҳсулот ҷойгир накардааст.</p>
        </div>
      )}

      <Link href="/shops" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
        Ҳамаи дӯконҳо
      </Link>
    </div>
  );
}
