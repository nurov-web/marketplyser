"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterPanel } from "@/components/search/FilterPanel";
import { Icon } from "@/components/ui/Icon";
import type { Category, Product } from "@/types";

function SearchInner() {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const urlQ = params.get("q") || "";
  const urlCat = params.get("category") || "";
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCat);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(nextQ = q, nextCat = category) {
    setLoading(true);
    const sp = new URLSearchParams();
    if (nextQ) sp.set("q", nextQ);
    if (nextCat) sp.set("category", nextCat);
    if (minPrice) sp.set("minPrice", minPrice);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    if (minRating) sp.set("minRating", minRating);
    if (brand) sp.set("brand", brand);
    try {
      const data = await api<{ items: Product[] }>(`/api/products?${sp.toString()}`);
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api<{ items: Category[] }>("/api/categories")
      .then((d) => setCats(d.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setQ(urlQ);
    setCategory(urlCat);
    load(urlQ, urlCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ, urlCat]);

  return (
    <div className="container-n py-8 md:grid md:grid-cols-[300px_1fr] md:gap-8">
      <FilterPanel
        cats={cats}
        category={category}
        setCategory={setCategory}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        minRating={minRating}
        setMinRating={setMinRating}
        brand={brand}
        setBrand={setBrand}
        onApply={() => load()}
        onReset={() => {
          setCategory("");
          setMinPrice("");
          setMaxPrice("");
          setMinRating("");
          setBrand("");
          setLoading(true);
          const sp = new URLSearchParams();
          if (q) sp.set("q", q);
          api<{ items: Product[] }>(`/api/products?${sp.toString()}`)
            .then((d) => setItems(d.items))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
        }}
      />
      <div>
        <form
          className="mb-5"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <label htmlFor="search-q" className="mb-1.5 block text-sm font-medium text-ink">
            Ҷустуҷӯ
          </label>
          <div className="relative">
            <Icon
              icon={Search}
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="search-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Номи маҳсулот, бренд, фурӯшанда..."
              className="pl-10"
            />
          </div>
        </form>

        {!loading && (
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            {q ? (
              <>
                Натиҷаҳо барои «<span className="font-medium text-ink">{q}</span>»:{" "}
                <span className="font-semibold tabular-nums text-ink">{items.length}</span> маҳсулот
              </>
            ) : (
              <>
                <span className="font-semibold tabular-nums text-ink">{items.length}</span> маҳсулот ёфт шуд
              </>
            )}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6"
          >
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
              <Icon icon={SearchX} className="h-10 w-10 text-primary" aria-hidden />
            </div>
            <h2 className="mt-5 text-lg font-bold text-ink">Маҳсулот ёфт нашуд</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Калима ё филтрро тағйир диҳед — ё каталоги пурраро бинед.
            </p>
            <Link href="/search" className="btn-primary mt-6">
              Ба каталог
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
