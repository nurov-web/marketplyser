"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminSettings() {
  const [delivery, setDelivery] = useState("5");
  useEffect(() => {
    api<{ items: { key: string; value: string }[] }>("/api/admin/settings").then((d) => {
      const row = d.items.find((i) => i.key === "deliveryFee");
      if (row) setDelivery(row.value);
    }).catch(() => {});
  }, []);

  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await api("/api/admin/settings", {
          method: "PUT",
          body: JSON.stringify({ items: [{ key: "deliveryFee", value: delivery }] }),
        });
        alert("Нигоҳ дошта шуд");
      }}
    >
      <h1 className="text-2xl font-bold">Settings</h1>
      <label className="text-sm">Нархи расонидани стандартӣ</label>
      <input value={delivery} onChange={(e) => setDelivery(e.target.value)} />
      <button className="btn-primary">Нигоҳ доштан</button>
    </form>
  );
}
