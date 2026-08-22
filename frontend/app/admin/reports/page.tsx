"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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
  const [penalties, setPenalties] = useState<any[]>([]);
  function load() {
    api<{ items: Row[] }>("/api/admin/reports").then((d) => setItems(d.items)).catch(() => {});
    api<{ items: any[] }>("/api/admin/penalties").then((d) => setPenalties(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports & ҷазо</h1>
      <div className="mt-4 space-y-3">
        {items.map((r) => (
          <article key={r.id} className="rounded-2xl bg-white p-4 shadow-soft">
            <p className="text-sm">{r.targetType} · {r.reason} · {r.status}</p>
            <p className="text-xs text-slate-500">{r.reporter.firstName} {r.reporter.lastName}</p>
            <button
              className="mt-2 text-xs"
              onClick={async () => {
                await api(`/api/admin/reports/${r.id}`, { method: "POST", body: JSON.stringify({ status: "RESOLVED" }) });
                load();
              }}
            >
              Resolve
            </button>
          </article>
        ))}
      </div>
      <h2 className="mt-8 font-semibold">Таърихи ҷазо</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {penalties.map((p) => (
          <li key={p.id} className="rounded-xl bg-white p-3 shadow-soft">
            {p.type} → {p.targetUser?.email} · {p.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
