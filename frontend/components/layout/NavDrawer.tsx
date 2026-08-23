"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { extraNav, isActive, primaryNav, roleNav } from "@/lib/nav";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";
import { LangSwitch } from "@/components/layout/LangSwitch";
import { Icon } from "@/components/ui/Icon";

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { open: openAuth } = useAuthModal();
  const roleLinks = roleNav(user?.role);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  return createPortal(
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 bg-slate-900/50"
            onClick={onClose}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div onClick={onClose}>
                <Logo />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-50"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("catalog")}</p>
              <ul className="space-y-0.5">
                {primaryNav.map((item) => {
                  const active = isActive(item.href, pathname, item.match);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold ${
                          active ? "bg-primary text-white" : "text-ink hover:bg-slate-50"
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("account")}</p>
              <ul className="space-y-0.5">
                {extraNav.map((item) => {
                  const active = isActive(item.href, pathname, item.match);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium ${
                          active ? "bg-primary-50 text-primary" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  );
                })}
                {roleLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={onClose} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-border p-4">
              <LangSwitch />
              {user ? (
                <button
                  type="button"
                  className="btn-ghost mt-3 w-full"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                >
                  <Icon icon={LogOut} className="h-4 w-4" aria-hidden />
                  {t("logout")}
                </button>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="btn-primary text-xs"
                    onClick={() => {
                      onClose();
                      openAuth("login");
                    }}
                  >
                    {t("login")}
                  </button>
                  <button
                    type="button"
                    className="btn-accent text-xs"
                    onClick={() => {
                      onClose();
                      openAuth("register");
                    }}
                  >
                    {t("register")}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>,
    document.body
  );
}
