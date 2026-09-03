"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  GitCompare,
  Kanban,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Package,
  ScrollText,
  Store,
  Truck,
} from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export function MoreMenuButton({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 16 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const isCourier = user?.role === "COURIER";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const node = e.target as Node;
      if (btnRef.current?.contains(node) || menuRef.current?.contains(node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
  }, [open]);

  const item = "flex min-h-11 items-center gap-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary";
  const iconWrap = "flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("more")}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-slate-200/80 transition ${
          open ? "text-primary ring-primary/40" : "text-slate-500 hover:text-ink"
        } ${className}`}
      >
        <Icon icon={MoreHorizontal} className="h-5 w-5" />
      </button>
      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 90 }}
            className="max-h-[min(28rem,75vh)] w-64 overflow-y-auto rounded-2xl border border-border bg-white py-1.5 shadow-lift"
          >
            {isAdmin && (
              <Link
                role="menuitem"
                href="/admin/crm"
                onClick={() => setOpen(false)}
                className={`${item} mx-1 rounded-xl bg-primary-50 font-semibold text-primary`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                  <Icon icon={Kanban} className="h-4 w-4" aria-hidden />
                </span>
                {t("crm")}
              </Link>
            )}
            {isAdmin && (
              <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className={item}>
                <span className={iconWrap}>
                  <Icon icon={LayoutDashboard} className="h-4 w-4" aria-hidden />
                </span>
                {t("adminPanel")}
              </Link>
            )}
            {isSeller && (
              <Link role="menuitem" href="/seller" onClick={() => setOpen(false)} className={item}>
                <span className={iconWrap}>
                  <Icon icon={Store} className="h-4 w-4" aria-hidden />
                </span>
                {t("sellerPanel")}
              </Link>
            )}
            {isCourier && (
              <Link role="menuitem" href="/courier" onClick={() => setOpen(false)} className={item}>
                <span className={iconWrap}>
                  <Icon icon={Truck} className="h-4 w-4" aria-hidden />
                </span>
                {t("courierPanel")}
              </Link>
            )}
            {(user?.role === "USER" || user?.role === "SELLER") && (
              <Link role="menuitem" href="/courier" onClick={() => setOpen(false)} className={item}>
                <span className={iconWrap}>
                  <Icon icon={Truck} className="h-4 w-4" aria-hidden />
                </span>
                {t("becomeCourier")}
              </Link>
            )}
            <Link role="menuitem" href="/chat" onClick={() => setOpen(false)} className={item}>
              <span className={iconWrap}>
                <Icon icon={MessageCircle} className="h-4 w-4" aria-hidden />
              </span>
              {t("chat")}
            </Link>
            <Link role="menuitem" href="/compare" onClick={() => setOpen(false)} className={item}>
              <span className={iconWrap}>
                <Icon icon={GitCompare} className="h-4 w-4" aria-hidden />
              </span>
              {t("compare")}
            </Link>
            <Link role="menuitem" href="/orders" onClick={() => setOpen(false)} className={item}>
              <span className={iconWrap}>
                <Icon icon={Package} className="h-4 w-4" aria-hidden />
              </span>
              {t("orders")}
            </Link>
            <Link role="menuitem" href="/rules" onClick={() => setOpen(false)} className={item}>
              <span className={iconWrap}>
                <Icon icon={ScrollText} className="h-4 w-4" aria-hidden />
              </span>
              {t("rules")}
            </Link>
          </div>,
          document.body
        )}
    </>
  );
}
