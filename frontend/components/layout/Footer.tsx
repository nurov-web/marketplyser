"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const { t } = useI18n();
  const { open } = useAuthModal();
  return (
    <footer className="mt-24 hidden bg-slate-950 pb-10 pt-16 text-slate-300 md:block">
      <div className="container-n grid gap-12 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">{t("footerBlurb")}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("buyer")}</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <Link href="/search" className="hover:text-white">{t("products")}</Link>
            <Link href="/shops" className="hover:text-white">{t("shops")}</Link>
            <Link href="/compare" className="hover:text-white">{t("compare")}</Link>
            <Link href="/orders" className="hover:text-white">{t("orders")}</Link>
            <Link href="/favorites" className="hover:text-white">{t("favorites")}</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("seller")}</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <button type="button" onClick={() => open("register")} className="text-left hover:text-white">{t("startSelling")}</button>
            <Link href="/seller" className="hover:text-white">{t("sellerPanel")}</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("platform")}</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <Link href="/rules" className="hover:text-white">{t("rules")}</Link>
            <Link href="/shops" className="hover:text-white">{t("shops")}</Link>
          </div>
        </div>
      </div>
      <p className="container-n mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">© {new Date().getFullYear()} Nurov Marketplace</p>
    </footer>
  );
}
