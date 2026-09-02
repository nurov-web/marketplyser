"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  FolderTree,
  LayoutDashboard,
  MessageSquareWarning,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";

const items = [
  { href: "/admin", label: "Омор", short: "Омор", icon: LayoutDashboard },
  { href: "/admin/products", label: "Молҳо", short: "Мол", icon: Package },
  { href: "/admin/categories", label: "Категорияҳо", short: "Кат.", icon: FolderTree },
  { href: "/admin/orders", label: "Фармоишҳо", short: "Фарм.", icon: ShoppingBag },
  { href: "/admin/services", label: "Хизматҳо", short: "Хизм.", icon: Wrench },
  { href: "/admin/users", label: "Корбарон", short: "Корб.", icon: Users },
  { href: "/admin/sellers", label: "Фурӯшандагон", short: "Seller", icon: Store },
  { href: "/admin/reviews", label: "Баррасиҳо", short: "Барраси", icon: MessageSquareWarning },
  { href: "/admin/reports", label: "Шикоятҳо", short: "Шикоят", icon: Wallet },
  { href: "/admin/crm", label: "CRM", short: "CRM", icon: Shield },
  { href: "/admin/settings", label: "Танзимот", short: "Танз.", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role !== "ADMIN") router.push("/");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        Дастрасӣ танҳо барои Admin
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl gap-0 md:gap-6">
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="hero-pattern sticky top-20 overflow-hidden rounded-2xl text-white shadow-lift">
          <div className="px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200">Nurov</p>
            <h2 className="mt-1 text-xl font-bold text-white">Панели Admin</h2>
            <p className="mt-2 text-xs leading-5 text-blue-100/90">Мол, категория, фармоиш ва корбарон</p>
          </div>
          <nav className="px-3 pb-4">
            {items.map((i) => {
              const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`mb-1 flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition ${
                    active ? "bg-white/20 text-white shadow-sm ring-1 ring-white/20" : "text-blue-100/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon icon={i.icon} className="h-4 w-4 shrink-0" aria-hidden />
                  {i.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/15 px-4 py-4">
            <p className="truncate text-xs font-semibold text-white">{user.firstName} {user.lastName}</p>
            <p className="truncate text-[11px] text-blue-100/80">{user.email}</p>
            <Link href="/" className="mt-3 flex min-h-10 items-center gap-2 text-xs font-semibold text-sky-200 hover:text-white">
              <Icon icon={ArrowLeft} className="h-3.5 w-3.5" aria-hidden />
              Ба сайт
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-6 md:pb-8">
        <div className="mb-4 flex gap-1.5 overflow-x-auto no-scrollbar md:hidden">
          {items.map((i) => {
            const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-inset ${
                  active ? "bg-primary text-white ring-primary" : "bg-white text-ink ring-border shadow-soft"
                }`}
              >
                <Icon icon={i.icon} className="h-3.5 w-3.5" aria-hidden />
                {i.short}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
