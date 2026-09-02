"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { href: "/seller", label: "Dashboard" },
  { href: "/seller/products", label: "Маҳсулот" },
  { href: "/seller/orders", label: "Фармоишҳо" },
  { href: "/seller/services", label: "Хизматҳо" },
  { href: "/seller/chat", label: "Чат" },
  { href: "/seller/profile", label: "Профил" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, seller, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role !== "SELLER" && user.role !== "ADMIN") router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return <div className="py-20 text-center">Боргирӣ...</div>;
  if (seller && seller.status !== "APPROVED" && user.role !== "ADMIN") {
    return (
      <div className="container-n py-16 text-center">
        <h1 className="text-2xl font-bold">Seller Panel</h1>
        <p className="mt-3 text-slate-500">Статус: {seller.status}. Пас аз тасдиқи Admin дастрас мешавад.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh]">
      <aside className="hidden w-56 shrink-0 bg-ink text-white md:block">
        <p className="px-5 py-5 font-bold">Seller</p>
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={`block px-5 py-2.5 text-sm ${pathname === i.href ? "bg-white/10 text-gold" : "text-white/70 hover:bg-white/5"}`}>
            {i.label}
          </Link>
        ))}
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
