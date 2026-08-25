"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import type { User } from "@/types";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<(User & { seller?: { status: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api<{ items: typeof items }>(`/api/admin/users?q=${encodeURIComponent(q)}`);
      setItems(d.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function act(id: string, action: string) {
    const reason = prompt("Сабаб?") || action;
    await api(`/api/admin/users/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) });
    load();
  }

  const actions: { key: string; label: string; tone?: string }[] = [
    { key: "warn", label: "Огоҳӣ" },
    { key: "restrict", label: "Маҳдуд" },
    { key: "block", label: "Блок" },
    { key: "unblock", label: "Озод" },
    { key: "delete", label: "Нест", tone: "text-red-700" },
  ];

  return (
    <div>
      <AdminPageHeader title="Корбарон" description="Ҷустуҷӯ, огоҳӣ, маҳдудият ва нест кардани аккаунт." />

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ном, email ё телефон..." className="sm:flex-1" />
        <button type="submit" className="btn-primary min-h-11">Ҷустуҷӯ</button>
      </form>

      {loading && <div className="mt-6 skeleton h-32 rounded-2xl" />}

      <div className="mt-6 space-y-3">
        {items.map((u) => (
          <AdminCard key={u.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{u.firstName} {u.lastName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{u.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">{u.role}</span>
                  <StatusBadge status={u.accountStatus} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`btn-ghost min-h-9 px-3 text-xs ${a.tone || ""}`}
                  onClick={() => act(u.id, a.key)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
