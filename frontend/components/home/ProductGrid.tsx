"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/types";

export function ProductGrid({ title, products, href }: { title: string; products: Product[]; href?: string }) {
  const { t } = useI18n();
  if (!products?.length) return null;
  return (
    <section className="container-n mt-block">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-primary hover:text-primary-700">
            {t("seeAll")}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
