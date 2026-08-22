"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav, isActive } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";

export function MainNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className={className} aria-label={t("menu")}>
      <ul className="flex items-center gap-1">
        {primaryNav.map((item) => {
          const active = isActive(item.href, pathname, item.match);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition ${
                  active ? "text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                }`}
              >
                {t(item.key)}
                {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
