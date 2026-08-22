"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n";

const MAP: Record<string, Key> = {
  search: "products",
  product: "products",
  shops: "shops",
  shop: "shops",
  cart: "cart",
  checkout: "checkout",
  orders: "orders",
  favorites: "favorites",
  compare: "compare",
  rules: "rules",
  chat: "chat",
  profile: "profile",
  seller: "sellerPanel",
  admin: "adminPanel",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { t } = useI18n();

  if (!pathname || pathname === "/") return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) return null;

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [{ href: "/", label: t("home") }];

  parts.forEach((part, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const key = MAP[part];
    if (key) crumbs.push({ href, label: t(key) });
  });

  const cat = params.get("category");
  if (pathname.startsWith("/search") && cat) {
    crumbs.push({ href: `/search?category=${cat}`, label: cat });
  }

  const unique = crumbs.filter((c, i, arr) => i === 0 || c.label !== arr[i - 1].label);
  if (unique.length < 2) return null;

  return (
    <nav className="container-n pt-4" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {unique.map((c, i) => {
          const last = i === unique.length - 1;
          return (
            <li key={`${c.href}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {last ? (
                <span className="font-medium text-ink" aria-current="page">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-primary">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
