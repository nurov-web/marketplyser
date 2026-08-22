"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GitCompare, Package, Plus, ShoppingBag, Star, Store, Tag, X } from "lucide-react";
import { api, mediaUrl, money } from "@/lib/api";
import { getCompareIds, toggleCompare } from "@/lib/compare";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";

const MAX = 3;
const enterEase = [0.22, 1, 0.36, 1] as const;

function num(v: number | string | null | undefined) {
  return Number(v || 0);
}

function differs(values: string[]) {
  return new Set(values).size > 1;
}

export default function ComparePage() {
  const [items, setItems] = useState<Product[] | null>(null);
  const { add } = useCart();
  const { user } = useAuth();
  const { open } = useAuthModal();
  const reduce = useReducedMotion();

  function load() {
    const ids = getCompareIds();
    if (!ids.length) {
      setItems([]);
      return;
    }
    api<{ items: Product[] }>(`/api/products?ids=${ids.join(",")}&limit=12`)
      .then((d) => {
        const order = new Map(ids.map((id, i) => [id, i]));
        setItems([...d.items].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)));
      })
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  const specKeys = useMemo(
    () => Array.from(new Set((items || []).flatMap((p) => Object.keys(p.specs || {})))),
    [items]
  );

  const cheapest = useMemo(() => {
    if (!items || items.length < 2) return null;
    return Math.min(...items.map((p) => num(p.finalPrice)));
  }, [items]);

  const topRated = useMemo(() => {
    if (!items || items.length < 2) return null;
    const max = Math.max(...items.map((p) => num(p.rating)));
    return max > 0 ? max : null;
  }, [items]);

  if (items === null) {
    return (
      <div className="container-n py-8">
        <div className="skeleton h-10 w-64" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <motion.div
        className="container-n py-16"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: enterEase }}
      >
        <div className="mx-auto max-w-lg rounded-[1.75rem] border border-dashed border-border bg-white px-6 py-14 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
            <Icon icon={GitCompare} className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Муқоисаи маҳсулот</h1>
          <p className="mt-2 text-sm text-muted-foreground">То 3 маҳсулот илова кунед ва фарқи нарх, бренд ва хусусиятҳоро якҷоя бинед.</p>
          <Link href="/search" className="btn-primary mt-6">
            <Icon icon={Plus} className="h-4 w-4" aria-hidden />
            Ба каталог
          </Link>
        </div>
      </motion.div>
    );
  }

  const slots = MAX - items.length;
  const cols = `minmax(8.5rem,11rem) repeat(${items.length}, minmax(15rem,1fr))${slots ? ` repeat(${slots}, minmax(13rem,1fr))` : ""}`;

  const rows: { label: string; icon?: typeof Star; values: string[]; win?: (i: number) => boolean }[] = [
    {
      label: "Нарх",
      icon: Tag,
      values: items.map((p) => money(p.finalPrice)),
      win: (i) => cheapest != null && num(items[i].finalPrice) === cheapest,
    },
    { label: "Бренд", values: items.map((p) => p.brand || "—") },
    {
      label: "Рейтинг",
      icon: Star,
      values: items.map((p) => (num(p.reviewCount) ? `${num(p.rating).toFixed(1)} · ${p.reviewCount}` : "Ҳанӯз нест")),
      win: (i) => topRated != null && num(items[i].rating) === topRated,
    },
    { label: "Захира", icon: Package, values: items.map((p) => (p.stock > 0 ? `${p.stock} дона` : "Нест")) },
    { label: "Тахфиф", values: items.map((p) => (p.discount ? `−${p.discount}%` : "Нест")) },
    { label: "Фурӯшанда", icon: Store, values: items.map((p) => p.seller?.shopName || "—") },
    ...specKeys.map((k) => ({ label: k, values: items.map((p) => p.specs?.[k] || "—") })),
  ];

  return (
    <motion.div
      className="container-n py-8"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: enterEase }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Compare</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Муқоисаи маҳсулот</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} аз {MAX} ҷой. {items.length < 2 ? "Яке дигар илова кунед, то фарқ равшан шавад." : "Қиматҳои беҳтарин бо ранги сабз ҷудо шудаанд."}
          </p>
        </div>
        <Link href="/search" className="btn-ghost text-sm">
          <Icon icon={Plus} className="h-4 w-4" aria-hidden />
          Иловаи маҳсулот
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="grid min-w-[40rem] gap-x-3" style={{ gridTemplateColumns: cols }}>
          <div className="sticky left-0 z-10 flex items-end pb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Хусусият</p>
          </div>
          {items.map((p) => (
            <article key={p.id} className="card-n mb-3 overflow-hidden p-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(p.images[0]?.url, "lg")} alt={p.name} className="h-full w-full object-cover" />
                {p.discount > 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">−{p.discount}%</span>
                )}
              </div>
              <Link href={`/product/${p.id}`} className="mt-3 block text-base font-bold leading-snug hover:text-primary">
                {p.name}
              </Link>
              <p className="mt-1 text-lg font-bold tabular-nums text-primary">{money(p.finalPrice)}</p>
              {p.discount > 0 && <p className="text-xs text-slate-400 line-through">{money(p.price)}</p>}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="btn-primary min-h-11 flex-1 text-xs"
                  onClick={() => (user ? add(p.id) : open("login"))}
                >
                  <Icon icon={ShoppingBag} className="h-4 w-4" aria-hidden />
                  Сабад
                </button>
                <button
                  type="button"
                  className="btn-ghost min-h-11 min-w-11 px-3"
                  aria-label="Хориҷ аз муқоиса"
                  onClick={() => {
                    toggleCompare(p.id);
                    load();
                  }}
                >
                  <Icon icon={X} className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </article>
          ))}
          {Array.from({ length: slots }).map((_, i) => (
            <Link
              key={`slot-${i}`}
              href="/search"
              className="mb-3 flex min-h-[18rem] flex-col items-center justify-center rounded-[1.25rem] border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 text-center transition hover:border-primary/40 hover:bg-primary-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-soft">
                <Icon icon={Plus} className="h-5 w-5" aria-hidden />
              </span>
              <span className="mt-3 text-sm font-semibold text-slate-600">Маҳсулот илова кунед</span>
              <span className="mt-1 text-xs text-muted-foreground">Аз каталог интихоб</span>
            </Link>
          ))}

          {rows.map((row) => {
            const highlight = items.length > 1 && differs(row.values);
            return (
              <div key={row.label} className="contents">
                <div className="sticky left-0 z-10 flex items-center gap-2 rounded-l-xl bg-[var(--color-bg)] py-3 pr-2 text-sm font-semibold text-slate-600">
                  {row.icon ? <Icon icon={row.icon} className="h-4 w-4 text-slate-400" aria-hidden /> : null}
                  {row.label}
                </div>
                {row.values.map((v, i) => {
                  const win = highlight && row.win?.(i);
                  return (
                    <div
                      key={`${row.label}-${items[i].id}`}
                      className={`rounded-xl px-3 py-3 text-sm ${
                        win ? "bg-emerald-50 font-semibold text-emerald-800" : highlight ? "bg-white text-ink" : "bg-white/70 text-slate-600"
                      }`}
                    >
                      {v}
                    </div>
                  );
                })}
                {Array.from({ length: slots }).map((_, i) => (
                  <div key={`${row.label}-empty-${i}`} className="rounded-xl bg-transparent px-3 py-3" />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
