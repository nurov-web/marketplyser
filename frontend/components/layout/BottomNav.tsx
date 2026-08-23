"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import { Icon } from "@/components/ui/Icon";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { count } = useCart();
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) return null;

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/search", label: t("catalog"), icon: LayoutGrid },
    { href: "/cart", label: t("cart"), icon: ShoppingBag },
    { href: "/profile", label: t("profile"), icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/50 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label={t("menu")}>
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon icon={item.icon} className="h-5 w-5" aria-hidden />
                  {item.href === "/cart" && count > 0 && (
                    <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[9px] font-bold text-ink">
                      {count}
                    </span>
                  )}
                </span>
                {item.label}
                {active && <span className="absolute inset-x-6 bottom-1 h-0.5 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
