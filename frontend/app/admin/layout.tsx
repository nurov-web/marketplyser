"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import { StrokeText } from "@/components/motion/StrokeText";

const items = [
  { href: "/admin", label: "Омор", icon: LayoutDashboard },
  { href: "/admin/products", label: "Молҳо", icon: Package },
  { href: "/admin/categories", label: "Категорияҳо", icon: FolderTree },
  { href: "/admin/orders", label: "Фармоишҳо", icon: ShoppingBag },
  { href: "/admin/users", label: "Корбарон", icon: Users },
  { href: "/admin/sellers", label: "Фурӯшандагон", icon: Store },
  { href: "/admin/reviews", label: "Баррасиҳо", icon: MessageSquareWarning },
  { href: "/admin/reports", label: "Шикоятҳо", icon: Wallet },
  { href: "/admin/crm", label: "CRM Bitrix", icon: Shield },
  { href: "/admin/settings", label: "Танзимот", icon: Settings },
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
    return <div className="py-20 text-center text-slate-500">Дастрасӣ танҳо барои Admin</div>;
  }

  return (
    <div className="flex min-h-[80vh]">
      <aside className="hero-pattern hidden w-60 shrink-0 text-white md:block">
        <div className="px-5 py-6">
          <p className="kicker">Nurov</p>
          <h1 className="mt-1 text-2xl text-white">
            <StrokeText text="Admin" />
          </h1>
        </div>
        <nav className="px-3 pb-6">
          {items.map((i) => {
            const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`mb-1 flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition ${
                  active ? "bg-white/15 text-white shadow-sm" : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon icon={i.icon} className="h-4 w-4 shrink-0" aria-hidden />
                {i.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar md:hidden">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${
                (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href))
                  ? "bg-primary text-white"
                  : "bg-white text-ink shadow-soft"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
