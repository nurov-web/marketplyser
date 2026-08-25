"use client";

import { useState } from "react";
import { RotateCcw, Search, SlidersHorizontal, Sparkles, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { RatingPicker } from "@/components/ui/RatingPicker";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/types";

export function FilterPanel({
  cats,
  category,
  setCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  brand,
  setBrand,
  onApply,
  onReset,
}: {
  cats: Category[];
  category: string;
  setCategory: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  minRating: string;
  setMinRating: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = [category, minPrice, maxPrice, minRating, brand].filter(Boolean).length;

  return (
    <>
      <button
        type="button"
        className="mb-4 flex w-full min-h-11 items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold shadow-soft md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        <span className="flex items-center gap-2">
          <Icon icon={SlidersHorizontal} className="h-4 w-4 text-primary" aria-hidden />
          Филтр
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-ink">{activeCount}</span>
          )}
        </span>
        <Icon icon={ChevronDown} className={`h-4 w-4 transition ${mobileOpen ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <motion.aside
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-6 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-lift backdrop-blur-md md:sticky md:top-24 md:mb-0 md:block md:self-start ${mobileOpen ? "block" : "hidden md:block"}`}
    >
      <div className="relative overflow-hidden px-5 py-5 text-white">
        <div className="absolute inset-0 hero-pattern" />
        {!reduce && (
          <>
            <motion.span
              className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl"
              animate={{ y: [0, 10, 0], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-sky-300/40 blur-2xl"
              animate={{ x: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Icon icon={SlidersHorizontal} className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">Nurov</p>
              <h2 className="text-xl font-bold leading-none">Филтр</h2>
            </div>
          </div>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-ink"
            >
              {activeCount} фаъол
            </motion.span>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Нарх, сомонӣ</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Аз</span>
                <input
                  inputMode="numeric"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-11 rounded-xl bg-white px-3"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">То</span>
                <input
                  inputMode="numeric"
                  placeholder="20000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-11 rounded-xl bg-white px-3"
                />
              </label>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Категория</p>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => {
              const active = category === c.slug;
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(active ? "" : c.slug)}
                  whileHover={reduce ? undefined : { y: -1 }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  className={`relative min-h-10 overflow-hidden rounded-full px-3.5 text-[13px] font-semibold transition ${
                    active ? "text-white" : "bg-slate-100 text-ink hover:bg-primary-50 hover:text-primary"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-cat-pill"
                      className="absolute inset-0 rounded-full bg-primary shadow-soft"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative">{c.name}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Рейтинг</p>
          <RatingPicker value={minRating} onChange={setMinRating} />
        </section>

        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Бренд</p>
          <div className="relative">
            <Icon icon={Sparkles} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" aria-hidden />
            <input
              className="h-12 rounded-2xl pl-10"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Apple, Samsung..."
            />
          </div>
        </section>

        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-ghost flex-1 text-xs" onClick={onReset}>
            <Icon icon={RotateCcw} className="h-3.5 w-3.5" aria-hidden />
            Тоза
          </button>
          <motion.button
            type="button"
            onClick={onApply}
            whileHover={reduce ? undefined : { y: -1 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            className="btn-primary relative flex-[2] overflow-hidden"
          >
            {!reduce && (
              <motion.span
                className="pointer-events-none absolute inset-y-0 w-16 bg-white/25 blur-md"
                animate={{ x: ["-40%", "220%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <Icon icon={Search} className="relative h-4 w-4" aria-hidden />
            <span className="relative">Ҷустуҷӯ</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
