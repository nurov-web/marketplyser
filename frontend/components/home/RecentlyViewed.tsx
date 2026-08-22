"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/home/ProductGrid";
import { getRecentIds } from "@/lib/recent";
import type { Product } from "@/types";

export function RecentlyViewed() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    const ids = getRecentIds();
    if (!ids.length) return;
    api<{ items: Product[] }>(`/api/products?ids=${ids.join(",")}&limit=12`)
      .then((d) => {
        const map = new Map(d.items.map((p) => [p.id, p]));
        setItems(ids.map((id) => map.get(id)).filter(Boolean) as Product[]);
      })
      .catch(() => {});
  }, []);
  if (!items.length) return null;
  return <ProductGrid title="Ба наздикӣ дидашуда" products={items} />;
}
