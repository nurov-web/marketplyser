"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  Cpu,
  Footprints,
  GitCompare,
  Headphones,
  Home,
  Kanban,
  Laptop,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Monitor,
  MoreHorizontal,
  Package,
  ScrollText,
  Shirt,
  Smartphone,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import type { Category } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  accessories: Headphones,
  computers: Monitor,
  clothes: Shirt,
  laptops: Laptop,
  shoes: Footprints,
  phones: Smartphone,
  home: Home,
  electronics: Cpu,
};

const COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
];

export function CategoryBar({ cats }: { cats: Category[] }) {
  const params = useSearchParams();
  const active = params.get("category");
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  if (!cats.length) return null;

  return (
    <nav className="relative border-t border-border/70 bg-white" aria-label="Категорияҳо">
      <div className="container-n relative">
        <LayoutGroup>
          <motion.div
            className="no-scrollbar flex gap-2 overflow-x-auto py-2.5 pr-14"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {cats.map((c, i) => {
              const selected = active === c.slug;
              const Lucide = ICONS[c.slug] || LayoutGrid;
              return (
                <motion.div
                  key={c.id}
                  variants={
                    reduce
                      ? undefined
                      : {
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                        }
                  }
                >
                  <Link
                    href={`/search?category=${c.slug}`}
                    aria-current={selected ? "page" : undefined}
                    className={`relative flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      selected ? "text-white shadow-lg shadow-primary/30" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="cat-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-primary to-sky-500"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                        selected ? "bg-white/20 text-white" : COLORS[i % COLORS.length]
                      }`}
                    >
                      <Icon icon={Lucide} className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="relative z-10">{c.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>

        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <button
          ref={btnRef}
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          aria-label="Бештар"
          className={`absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-slate-200/80 transition ${
            moreOpen ? "text-primary ring-primary/40" : "text-slate-500 hover:text-ink hover:ring-slate-300"
          }`}
        >
          <Icon icon={MoreHorizontal} className="h-5 w-5" />
        </button>
        <MoreMenu open={moreOpen} anchor={btnRef.current} menuRef={menuRef} cats={cats} onPick={() => setMoreOpen(false)} />
      </div>
    </nav>
  );
}

function MoreMenu({
  open,
  anchor,
  menuRef,
  cats,
  onPick,
}: {
  open: boolean;
  anchor: HTMLButtonElement | null;
  menuRef: RefObject<HTMLDivElement | null>;
  cats: Category[];
  onPick: () => void;
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [pos, setPos] = useState({ top: 0, right: 16 });
  const [mounted, setMounted] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open || !anchor) return;
    const r = anchor.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
  }, [open, anchor]);

  if (!mounted || !open) return null;

  const item = "flex min-h-11 items-center gap-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary";
  const iconWrap = "flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600";

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 90 }}
      className="max-h-[min(28rem,75vh)] w-64 overflow-y-auto rounded-2xl border border-border bg-white py-1.5 shadow-lift"
    >
      {isAdmin && (
        <Link role="menuitem" href="/admin/crm" onClick={onPick} className={`${item} mx-1 rounded-xl bg-primary-50 font-semibold text-primary`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
            <Icon icon={Kanban} className="h-4 w-4" aria-hidden />
          </span>
          {t("crm")}
        </Link>
      )}
      {isAdmin && (
        <Link role="menuitem" href="/admin" onClick={onPick} className={item}>
          <span className={iconWrap}>
            <Icon icon={LayoutDashboard} className="h-4 w-4" aria-hidden />
          </span>
          {t("adminPanel")}
        </Link>
      )}
      {isSeller && (
        <Link role="menuitem" href="/seller" onClick={onPick} className={item}>
          <span className={iconWrap}>
            <Icon icon={Store} className="h-4 w-4" aria-hidden />
          </span>
          {t("sellerPanel")}
        </Link>
      )}
      <Link role="menuitem" href="/chat" onClick={onPick} className={item}>
        <span className={iconWrap}>
          <Icon icon={MessageCircle} className="h-4 w-4" aria-hidden />
        </span>
        {t("chat")}
      </Link>
      <Link role="menuitem" href="/compare" onClick={onPick} className={item}>
        <span className={iconWrap}>
          <Icon icon={GitCompare} className="h-4 w-4" aria-hidden />
        </span>
        {t("compare")}
      </Link>
      <Link role="menuitem" href="/orders" onClick={onPick} className={item}>
        <span className={iconWrap}>
          <Icon icon={Package} className="h-4 w-4" aria-hidden />
        </span>
        {t("orders")}
      </Link>
      <Link role="menuitem" href="/rules" onClick={onPick} className={item}>
        <span className={iconWrap}>
          <Icon icon={ScrollText} className="h-4 w-4" aria-hidden />
        </span>
        {t("rules")}
      </Link>

      <p className="mt-1 border-t border-border px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t("categories")}
      </p>
      {cats.map((c) => {
        const Lucide = ICONS[c.slug] || LayoutGrid;
        return (
          <Link
            key={c.id}
            role="menuitem"
            href={`/search?category=${c.slug}`}
            onClick={onPick}
            className={item}
          >
            <span className={iconWrap}>
              <Icon icon={Lucide} className="h-3.5 w-3.5" aria-hidden />
            </span>
            {c.name}
          </Link>
        );
      })}
      <Link role="menuitem" href="/search" onClick={onPick} className={`${item} font-semibold text-primary`}>
        {t("seeAll")}
      </Link>
    </div>,
    document.body
  );
}
