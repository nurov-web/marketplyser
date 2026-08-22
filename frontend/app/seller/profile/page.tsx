"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function SellerProfile() {
  const { seller, refresh } = useAuth();
  const [form, setForm] = useState({ shopName: "", phone: "", email: "", address: "", description: "" });
  useEffect(() => {
    if (seller) {
      setForm({
        shopName: seller.shopName,
        phone: seller.phone,
        email: seller.email,
        address: seller.address,
        description: seller.description,
      });
    }
  }, [seller]);

  return (
    <form
      className="max-w-lg space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await api("/api/sellers/me", { method: "PUT", body: JSON.stringify(form) });
        refresh();
      }}
    >
      <h1 className="text-2xl font-bold">Профили дӯкон</h1>
      <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button className="btn-primary">Нигоҳ доштан</button>
    </form>
  );
}
