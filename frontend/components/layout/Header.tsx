"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, GitCompare, Heart, LayoutDashboard, Menu, Search, ShoppingBag, Store, Truck, UserRound } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCart } from "@/hooks/useCart";
import { getOnce, mediaUrl, money, api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/layout/LangSwitch";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { MainNav } from "@/components/layout/MainNav";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { MoreMenuButton } from "@/components/layout/MoreMenuButton";
import type { Category } from "@/types";

export function Header() {
  const { user } = useAuth();
  const { open: openAuth } = useAuthModal();
  const { count } = useCart();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [unread, setUnread] = useState(0);
  const [hints, setHints] = useState<{ id: string; name: string; image?: string; finalPrice: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const panel = pathname.startsWith("/admin") || pathname.startsWith("/seller") || pathname.startsWith("/courier");
  const showCats = !panel && (pathname === "/" || pathname.startsWith("/search"));

  useEffect(() => {
    if (!showCats) return;
    getOnce<{ items: Category[] }>("/api/categories")
      .then((d) => setCats(d.items))
      .catch(() => {});
  }, [showCats]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHints([]);
      return;
    }
    const t = setTimeout(() => {
      api<{ items: { id: string; name: string; image?: string; finalPrice: number }[] }>(
        `/api/products/suggest?q=${encodeURIComponent(q.trim())}`
      )
        .then((d) => {
          setHints(d.items);
          setOpen(true);
        })
        .catch(() => setHints([]));
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!user) return;
    api<{ unread: number }>("/api/notifications")
      .then((d) => setUnread(d.unread))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  function goSearch(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  if (panel) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 shadow-glass backdrop-blur-xl">
        <div className="container-n flex h-14 items-center gap-3">
          <Logo />
          <p className="hidden text-sm font-semibold text-slate-600 sm:block">{pathname.startsWith("/admin") ? t("adminPanel") : t("sellerPanel")}</p>
          <div className="ml-auto flex items-center gap-2">
            <MoreMenuButton />
            {user && (
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white"
                aria-label={t("profile")}
              >
                {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?"}
              </Link>
            )}
            <Link href="/" className="btn-ghost h-10 px-3 text-xs">
              Nurov
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 shadow-glass backdrop-blur-xl backdrop-saturate-150">
      <div className="container-n flex h-16 items-center gap-3">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-50 lg:hidden"
          aria-label={t("menu")}
          aria-expanded={menu}
          onClick={() => setMenu(true)}
        >
          <Icon icon={Menu} className="h-5 w-5" />
        </button>
        <Logo />
        <form className="hidden min-w-0 flex-1 md:block" onSubmit={goSearch}>
          <label className="sr-only" htmlFor="site-search">
            {t("searchAria")}
          </label>
          <div className="relative">
            <Icon icon={Search} className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="site-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => hints.length && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 180)}
              placeholder={t("search")}
              className="h-11 rounded-full border-0 bg-slate-100/90 pl-11"
              autoComplete="off"
            />
            {open && hints.length > 0 && (
              <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                {hints.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/product/${h.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary-50"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {h.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(h.image)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <span className="flex-1 truncate">{h.name}</span>
                      <span className="tabular-nums text-xs font-semibold">{money(h.finalPrice)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-2.5">
          <div className="hidden items-center rounded-2xl bg-slate-100/80 p-0.5 ring-1 ring-inset ring-slate-200/80 md:flex">
            <Link
              href="/favorites"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-rose-500 hover:shadow-sm"
              aria-label={t("favorites")}
            >
              <Icon icon={Heart} className="h-5 w-5" />
            </Link>
            <Link
              href="/compare"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-primary hover:shadow-sm"
              aria-label={t("compare")}
            >
              <Icon icon={GitCompare} className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-primary hover:shadow-sm"
              aria-label={t("cart")}
            >
              <Icon icon={ShoppingBag} className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink ring-2 ring-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            {user && (
              <Link
                href="/profile"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-primary hover:shadow-sm"
                aria-label={t("notifications")}
              >
                <Icon icon={Bell} className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink ring-2 ring-white">
                    {unread > 9 ? "9+" : unread}
                    <span className="sr-only"> {t("notifications")}</span>
                  </span>
                )}
              </Link>
            )}
          </div>
          <div className="hidden sm:block">
            <LangSwitch />
          </div>
          {user ? (
            <Link
              href="/profile"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-soft ring-2 ring-white"
              aria-label={t("profile")}
            >
              {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || (
                <Icon icon={UserRound} className="h-4 w-4" />
              )}
            </Link>
          ) : (
            <button type="button" onClick={() => openAuth("login")} className="btn-primary min-h-11 px-4 text-xs">
              {t("login")}
            </button>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="btn-primary hidden min-h-11 rounded-full px-3 text-xs md:inline-flex lg:px-3.5"
            >
              <Icon icon={LayoutDashboard} className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">{t("adminPanel")}</span>
            </Link>
          )}
          {user?.role === "COURIER" && (
            <Link
              href="/courier"
              className="btn-primary hidden min-h-11 rounded-full px-3 text-xs md:inline-flex lg:px-3.5"
            >
              <Icon icon={Truck} className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">{t("courierPanel")}</span>
            </Link>
          )}
          {user?.role === "SELLER" && (
            <Link
              href="/seller"
              className="btn-primary hidden min-h-11 rounded-full px-3 text-xs md:inline-flex lg:px-3.5"
            >
              <Icon icon={Store} className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">{t("sellerPanel")}</span>
            </Link>
          )}
          <div className="hidden md:block">
            <MoreMenuButton />
          </div>
        </nav>
      </div>
      <div className="hidden border-t border-border/70 lg:block">
        <div className="container-n">
          <MainNav />
        </div>
      </div>
      <form className="container-n pb-3 md:hidden" onSubmit={goSearch}>
        <label className="sr-only" htmlFor="site-search-mobile">{t("searchAria")}</label>
        <input id="site-search-mobile" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} />
      </form>
      {showCats && (
        <Suspense>
          <CategoryBar cats={cats} />
        </Suspense>
      )}
      <NavDrawer open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}
