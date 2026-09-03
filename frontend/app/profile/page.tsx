"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  Kanban,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Package,
  Plus,
  ScrollText,
  Shield,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { toast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { StrokeText } from "@/components/motion/StrokeText";

const enterEase = [0.22, 1, 0.36, 1] as const;

type Tab = "account" | "alerts" | "addresses";
type Notif = { id: string; title: string; body: string; read: boolean; createdAt: string };
type Addr = { id: string; fullName: string; phone: string; city: string; address: string; isDefault: boolean };

const field = "rounded-xl !py-2.5";

export default function ProfilePage() {
  const { user, seller, loading, logout, refresh } = useAuth();
  const { open: openAuth } = useAuthModal();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("account");
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!loading && !user) openAuth("login", { next: "/profile" });
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
      api<{ items: Notif[] }>("/api/notifications")
        .then((d) => setNotifs(d.items))
        .catch(() => {});
    }
  }, [user, loading, openAuth]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (loading) {
    return (
      <div className="container-n max-w-3xl py-8">
        <div className="skeleton h-40" />
      </div>
    );
  }
  if (!user) return null;

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const unread = notifs.filter((n) => !n.read).length;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/me", { method: "PUT", body: JSON.stringify(form) });
      await refresh();
      toast("Нигоҳ дошта шуд");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof UserRound; count?: number }[] = [
    { id: "account", label: "Ҳисоб", icon: UserRound },
    { id: "alerts", label: "Огоҳиҳо", icon: Bell, count: unread },
    { id: "addresses", label: "Суроғаҳо", icon: MapPin },
  ];

  return (
    <motion.div
      className="container-n max-w-4xl py-8"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: enterEase }}
    >
      <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-lift ring-1 ring-black/5">
        <div className="hero-pattern relative px-5 pb-8 pt-10 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-sky-400/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <motion.div
                className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/30 backdrop-blur-md"
                initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.08, ease: enterEase }}
              >
                {initials || <Icon icon={UserRound} className="h-8 w-8" />}
              </motion.div>
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.16, ease: enterEase }}
              >
                <p className="kicker">{user.role === "ADMIN" ? "Admin" : user.role === "SELLER" ? "Seller" : user.role === "COURIER" ? "Доставчик" : "Профил"}</p>
                <h1 className="mt-1 text-3xl text-white sm:text-4xl">
                  <StrokeText text={`${user.firstName} ${user.lastName}`} as="span" />
                </h1>
                <p className="mt-1 text-sm text-blue-100">{user.email}</p>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              {user.role === "ADMIN" && (
                <Link href="/admin" className="btn-primary text-sm">
                  <Icon icon={LayoutDashboard} className="h-4 w-4" aria-hidden />
                  Панели Admin
                </Link>
              )}
              {user.role === "COURIER" && (
                <Link href="/courier" className="btn-primary text-sm">
                  <Icon icon={MapPin} className="h-4 w-4" aria-hidden />
                  Панели расонидан
                </Link>
              )}
              {user.role === "SELLER" && (
                <Link href="/seller" className="btn-primary text-sm">
                  <Icon icon={Store} className="h-4 w-4" aria-hidden />
                  Seller Panel
                </Link>
              )}
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25 hover:bg-white/20"
                  aria-label="Бештар"
                  aria-expanded={menu}
                  onClick={() => setMenu((v) => !v)}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {menu && (
                  <div role="menu" className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-white py-1 text-ink shadow-lift">
                    <Link role="menuitem" href="/orders" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50" onClick={() => setMenu(false)}>
                      <Package className="h-4 w-4" /> Фармоишҳо
                    </Link>
                    <Link role="menuitem" href="/chat" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50" onClick={() => setMenu(false)}>
                      <MessageCircle className="h-4 w-4" /> Чат
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link role="menuitem" href="/admin/crm" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50" onClick={() => setMenu(false)}>
                        <Kanban className="h-4 w-4" /> CRM Bitrix
                      </Link>
                    )}
                    <Link role="menuitem" href="/rules" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50" onClick={() => setMenu(false)}>
                      <ScrollText className="h-4 w-4" /> Қоидаҳо
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        await logout();
                        router.push("/");
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Баромадан
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <motion.div
            className="relative mt-5 flex flex-wrap gap-2"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.28, ease: enterEase }}
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              {user.role}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
              {user.accountStatus}
            </span>
            {seller?.status === "PENDING" && (
              <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-100">Seller интизор</span>
            )}
          </motion.div>
        </div>
        <motion.div
          className="px-5 pb-6 pt-5 sm:px-8"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32, ease: enterEase }}
        >
          <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ${
                  tab === t.id ? "bg-white text-ink shadow-sm" : "text-slate-500"
                }`}
              >
                <Icon icon={t.icon} className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{t.label}</span>
                {t.count ? (
                  <span className="absolute right-1.5 top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] text-ink">{t.count}</span>
                ) : null}
              </button>
            ))}
          </div>

          {tab === "account" && (
            <form onSubmit={save} className="mt-5 max-w-md space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-medium text-slate-500">
                  Ном
                  <input className={`${field} mt-1`} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="given-name" />
                </label>
                <label className="block text-xs font-medium text-slate-500">
                  Насаб
                  <input className={`${field} mt-1`} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" />
                </label>
              </div>
              <label className="block text-xs font-medium text-slate-500">
                Телефон
                <input className={`${field} mt-1`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
              </label>
              <button className="btn-primary w-full sm:w-auto" disabled={busy}>
                {busy ? "Интизор..." : "Нигоҳ доштан"}
              </button>
            </form>
          )}

          {tab === "alerts" && (
            <div className="mt-5">
              {notifs.length > 0 && (
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary"
                    onClick={async () => {
                      await api("/api/notifications/read-all", { method: "POST" });
                      setNotifs((list) => list.map((n) => ({ ...n, read: true })));
                    }}
                  >
                    Ҳамаро хондашуда
                  </button>
                </div>
              )}
              {notifs.length === 0 ? (
                <Empty icon={Bell} title="Огоҳӣ нест" text="Паёмҳо ва фармоишҳо ин ҷо мебароянд." />
              ) : (
                <ul className="space-y-2">
                  {notifs.map((n) => (
                    <li key={n.id} className={`rounded-2xl px-4 py-3 text-sm ${n.read ? "bg-muted" : "bg-amber-50"}`}>
                      <p className="font-semibold">{n.title}</p>
                      <p className="mt-0.5 text-slate-600">{n.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "addresses" && <AddressBook />}
        </motion.div>
      </article>
    </motion.div>
  );
}

function Empty({ icon, title, text }: { icon: typeof Bell; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <Icon icon={icon} className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function AddressBook() {
  const [items, setItems] = useState<Addr[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", city: "Душанбе", address: "" });
  const [busy, setBusy] = useState(false);

  function load() {
    api<{ items: Addr[] }>("/api/addresses")
      .then((d) => setItems(d.items))
      .catch(() => {});
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/addresses", { method: "POST", body: JSON.stringify({ ...form, isDefault: !items.length }) });
      setForm({ fullName: "", phone: "", city: "Душанбе", address: "" });
      setOpen(false);
      load();
      toast("Суроға илова шуд");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex justify-end">
        <button type="button" className="btn-primary h-10 px-4 text-sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden /> Илова
        </button>
      </div>
      {items.length === 0 ? (
        <Empty icon={MapPin} title="Суроға нест" text="Барои фармоиш як суроға илова кунед." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <li key={a.id} className="rounded-2xl border border-border p-4 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">
                  {a.fullName}
                  {a.isDefault && <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary">асосӣ</span>}
                </p>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={async () => {
                    await api(`/api/addresses/${a.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Хориҷ
                </button>
              </div>
              <p className="mt-1 text-muted-foreground">
                {a.city}, {a.address}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{a.phone}</p>
            </li>
          ))}
        </ul>
      )}
      <AddressModal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={add} className="space-y-3">
          <h2 id="addr-title" className="text-lg font-bold">
            Суроғаи нав
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <input className={field} required placeholder="Ном" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className={field} required placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <input className={field} required placeholder="Шаҳр" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className={field} required placeholder="Суроға" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Интизор..." : "Иловаи суроға"}
          </button>
        </form>
      </AddressModal>
    </div>
  );
}

function AddressModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="addr-title">
      <button type="button" className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" aria-label="Пӯшидан" onClick={onClose} />
      <div className="relative z-10 w-full rounded-t-3xl bg-white p-5 shadow-lift sm:max-w-sm sm:rounded-3xl">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Пӯшидан">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
