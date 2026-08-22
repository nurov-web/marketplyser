"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function PanelShell({
  title,
  items,
  role,
}: {
  title: string;
  items: { href: string; label: string }[];
  role: "SELLER" | "ADMIN";
}) {
  const { user, seller, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (role === "ADMIN" && user.role !== "ADMIN") router.push("/");
    if (role === "SELLER" && user.role !== "SELLER" && user.role !== "ADMIN") router.push("/");
  }, [user, loading, router, role]);

  if (loading || !user) return <div className="p-10 text-center text-slate-500">Боргирӣ...</div>;
  if (role === "SELLER" && seller && seller.status !== "APPROVED" && user.role !== "ADMIN") {
    return (
      <div className="container-n py-16 text-center">
        <h1 className="text-2xl font-bold">Seller Panel</h1>
        <p className="mt-3 text-slate-500">Статус: {seller.status}. Пас аз тасдиқи Admin дастрас мешавад.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-ink text-white md:block">
          <Link href="/" className="block px-5 py-5 font-bold">
            Nurov<span className="text-gold">.</span> {title}
          </Link>
          <nav className="px-3">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`mb-1 block rounded-xl px-3 py-2.5 text-sm ${
                  pathname === i.href ? "bg-white/10 text-accent" : "text-violet-100 hover:bg-white/5"
                }`}
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2 overflow-x-auto border-b bg-white px-4 py-3 md:hidden">
            {items.map((i) => (
              <Link key={i.href} href={i.href} className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs">
                {i.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
