"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function EditProduct() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(user?.role === "ADMIN" ? `/admin/products/${id}` : "/seller/products");
  }, [user, loading, id, router]);
  return <p className="py-16 text-center text-slate-500">Интизор...</p>;
}
