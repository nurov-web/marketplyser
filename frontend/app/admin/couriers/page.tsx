"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

type Row = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  vehicle: string;
  message: string;
  status: string;
  rejectReason?: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string; role: string };
};

export default function AdminCouriers() {
  const [items, setItems] = useState<Row[]>([]);

  function load() {
    api<{ items: Row[] }>("/api/admin/couriers").then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    const reason = action === "reject" ? prompt("Сабаби рад?") || "Рад шуд" : "Қабул";
    await api(`/api/admin/couriers/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) });
    load();
  }

  return (
    <div>
      <AdminPageHeader
        title="Доставчикҳо"
        description="Заявкаро қабул кунед — панели расонидан барои он корбар кушода мешавад."
      />

      <div className="mt-6 space-y-3">
        {items.map((s) => (
          <AdminCard key={s.id}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{s.fullName}</p>
              <StatusBadge status={s.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {s.user.firstName} {s.user.lastName} · {s.user.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {s.phone} · {s.city} · {s.vehicle}
            </p>
            {s.message ? <p className="mt-2 text-sm text-slate-600">{s.message}</p> : null}
            {s.status === "REJECTED" && s.rejectReason ? (
              <p className="mt-2 text-xs text-red-700">{s.rejectReason}</p>
            ) : null}
            {s.status === "PENDING" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-primary min-h-9 px-3 text-xs" onClick={() => act(s.id, "approve")}>
                  Тасдиқ
                </button>
                <button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={() => act(s.id, "reject")}>
                  Рад
                </button>
              </div>
            )}
          </AdminCard>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">Заявкаҳо ҳанӯз нестанд.</p>}
      </div>
    </div>
  );
}
