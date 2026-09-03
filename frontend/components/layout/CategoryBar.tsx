"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  CircuitBoard,
  GitCompare,
  Kanban,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Monitor,
  MoreHorizontal,
  Package,
  ScrollText,
  Shirt,
  Smartphone,
  Sofa,
  Store,
  Truck,
  Watch,
  Laptop,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { mediaUrl } from "@/lib/api";
import type { Category } from "@/types";

function ShoeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3.6 15.2c0 .9.7 1.6 1.6 1.6h12.4a2 2 0 0 0 1.94-1.55L21 11.8c.2-.8-.4-1.6-1.25-1.6h-3.55l-1.2-2.85A2.4 2.4 0 0 0 12.7 6H8.4L3.6 12.6v2.6Z" />
      <path d="M7.2 16.8v1.3M11.2 16.8v1.3M15.2 16.8v1.3" />
    </svg>
  );
}

const ICONS: Record<string, LucideIcon> = {
  accessories: Watch,
  computers: Monitor,
  clothes: Shirt,
  laptops: Laptop,
  phones: Smartphone,
  home: Sofa,
  electronics: CircuitBoard,
};

function CategoryGlyph({ slug, className }: { slug: string; className?: string }) {
  if (slug === "shoes") return <ShoeIcon className={className} />;
  return <Icon icon={ICONS[slug] || LayoutGrid} className={className} aria-hidden />;
}

function CategoryThumb({ cat, selected }: { cat: Category; selected?: boolean }) {
  if (cat.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaUrl(cat.image)}
        alt=""
        className={`h-8 w-8 rounded-full object-cover ring-1 ${selected ? "ring-white/40" : "ring-black/10"}`}
      />
    );
  }
  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
      <CategoryGlyph slug={cat.slug} className="h-4 w-4" />
    </span>
  );
}

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
        <motion.div
          className="no-scrollbar flex gap-1 overflow-x-auto py-2.5 pr-14"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
          }}
        >
          {cats.map((c) => {
            const selected = active === c.slug;
            return (
              <motion.div
                key={c.id}
                variants={{
                  hidden: { opacity: 0, x: 18 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <Link
                  href={`/search?category=${c.slug}`}
                  aria-current={selected ? "page" : undefined}
                  className={`group relative flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    selected ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  <span className="relative z-10">{c.name}</span>
                  <span className="relative z-10 transition duration-300 group-hover:scale-110">
                    <CategoryThumb cat={c} selected={selected} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

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
  const isCourier = user?.role === "COURIER";

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open || !anchor) return;
    const r = anchor.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
  }, [open, anchor]);

  if (!mounted || !open) return null;

  const item = "flex min-h-11 items-center justify-between gap-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary";
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
          {t("crm")}
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
            <Icon icon={Kanban} className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      )}
      {isAdmin && (
        <Link role="menuitem" href="/admin" onClick={onPick} className={item}>
          {t("adminPanel")}
          <span className={iconWrap}>
            <Icon icon={LayoutDashboard} className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      )}
      {isSeller && (
        <Link role="menuitem" href="/seller" onClick={onPick} className={item}>
          {t("sellerPanel")}
          <span className={iconWrap}>
            <Icon icon={Store} className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      )}
      {isCourier && (
        <Link role="menuitem" href="/courier" onClick={onPick} className={item}>
          {t("courierPanel")}
          <span className={iconWrap}>
            <Icon icon={Truck} className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      )}
      {(user?.role === "USER" || user?.role === "SELLER") && (
        <Link role="menuitem" href="/courier" onClick={onPick} className={item}>
          {t("becomeCourier")}
          <span className={iconWrap}>
            <Icon icon={Truck} className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      )}
      <Link role="menuitem" href="/chat" onClick={onPick} className={item}>
        {t("chat")}
        <span className={iconWrap}>
          <Icon icon={MessageCircle} className="h-4 w-4" aria-hidden />
        </span>
      </Link>
      <Link role="menuitem" href="/compare" onClick={onPick} className={item}>
        {t("compare")}
        <span className={iconWrap}>
          <Icon icon={GitCompare} className="h-4 w-4" aria-hidden />
        </span>
      </Link>
      <Link role="menuitem" href="/orders" onClick={onPick} className={item}>
        {t("orders")}
        <span className={iconWrap}>
          <Icon icon={Package} className="h-4 w-4" aria-hidden />
        </span>
      </Link>
      <Link role="menuitem" href="/rules" onClick={onPick} className={item}>
        {t("rules")}
        <span className={iconWrap}>
          <Icon icon={ScrollText} className="h-4 w-4" aria-hidden />
        </span>
      </Link>

      <p className="mt-1 border-t border-border px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t("categories")}
      </p>
      {cats.map((c) => {
        return (
          <Link
            key={c.id}
            role="menuitem"
            href={`/search?category=${c.slug}`}
            onClick={onPick}
            className={item}
          >
            {c.name}
            <span className={iconWrap}>
              <CategoryThumb cat={c} />
            </span>
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
