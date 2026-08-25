"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

type Row = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  reporter: { firstName: string; lastName: string };
};

export default function AdminReports() {
  const [items, setItems] = useState<Row[]>([]);
  const [penalties, setPenalties] = useState<{ id: string; type: string; reason: string; targetUser?: { email: string } }[]>([]);

  function load() {
    api<{ items: Row[] }>("/api/admin/reports").then((d) => setItems(d.items)).catch(() => {});
    api<{ items: typeof penalties }>("/api/admin/penalties").then((d) => setPenalties(d.items)).catch(() => {});
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader title="Шикоятҳо ва ҷазо" description="Шикоятҳои корбарон ва таърихи ҷазоҳо." />

      <div className="mt-6 space-y-3">
        {items.map((r) => (
          <AdminCard key={r.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink">{r.targetType}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
            <p className="mt-1 text-xs text-muted-foreground">{r.reporter.firstName} {r.reporter.lastName}</p>
            {r.status === "OPEN" && (
              <button
                type="button"
                className="btn-ghost mt-3 min-h-9 px-3 text-xs"
                onClick={async () => {
                  await api(`/api/admin/reports/${r.id}`, { method: "POST", body: JSON.stringify({ status: "RESOLVED" }) });
                  toast("Ҳал шуд");
                  load();
                }}
              >
                Ҳал кардан
              </button>
            )}
          </AdminCard>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold text-ink">Таърихи ҷазо</h2>
      <ul className="mt-4 space-y-2">
        {penalties.map((p) => (
          <AdminCard key={p.id} padding="p-3" className="text-sm">
            <span className="font-semibold">{p.type}</span>
            <span className="text-muted-foreground"> → {p.targetUser?.email}</span>
            <p className="mt-1 text-xs text-muted-foreground">{p.reason}</p>
          </AdminCard>
        ))}
      </ul>
    </div>
  );
}
