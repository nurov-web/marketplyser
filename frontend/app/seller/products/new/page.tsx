"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function NewProduct() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(user?.role === "ADMIN" ? "/admin/products/new" : "/seller/products");
  }, [user, loading, router]);
  return <p className="py-16 text-center text-slate-500">Интизор...</p>;
}
