"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SellerProducts() {
  const { user } = useAuth();
  if (user?.role === "ADMIN") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold">Молҳо дар панели Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Мол ва категорияро аз он ҷо илова ва нест кунед.</p>
        <Link href="/admin/products" className="btn-primary mt-6 min-h-12">
          Ба молҳо
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
      <h1 className="text-2xl font-bold">Танҳо Admin мол илова мекунад</h1>
      <p className="mt-2 text-sm text-muted-foreground">Шумо метавонед харид кунед. Илова ва нест кардани мол дар дасти Admin аст.</p>
      <Link href="/search" className="btn-primary mt-6 min-h-12">
        Ба каталог
      </Link>
    </div>
  );
}
