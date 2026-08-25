"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui";

export default function AdminSettings() {
  const [delivery, setDelivery] = useState("5");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ items: { key: string; value: string }[] }>("/api/admin/settings")
      .then((d) => {
        const row = d.items.find((i) => i.key === "deliveryFee");
        if (row) setDelivery(row.value);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader title="Танзимот" description="Параметрҳои умумии сайт." />

      <AdminCard className="mt-6 max-w-md">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api("/api/admin/settings", {
                method: "PUT",
                body: JSON.stringify({ items: [{ key: "deliveryFee", value: delivery }] }),
              });
              toast("Нигоҳ дошта шуд");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Хато", "err");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm font-semibold text-ink">
            Нархи расонидани стандартӣ (сомонӣ)
            <input
              className="mt-1.5"
              inputMode="decimal"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-primary min-h-11" disabled={busy}>
            {busy ? "Интизор..." : "Нигоҳ доштан"}
          </button>
        </form>
      </AdminCard>
    </div>
  );
}
