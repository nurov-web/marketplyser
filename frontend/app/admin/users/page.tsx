"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<(User & { seller?: { status: string } })[]>([]);

  async function load() {
    const d = await api<{ items: typeof items }>(`/api/admin/users?q=${encodeURIComponent(q)}`);
    setItems(d.items);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  async function act(id: string, action: string) {
    const reason = prompt("Сабаб?") || action;
    await api(`/api/admin/users/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="mt-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ҷустуҷӯ" />
        <button className="btn-primary" onClick={load}>Search</button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr><th className="p-3">Ном</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.accountStatus}</td>
                <td className="space-x-2 p-3 text-xs">
                  <button onClick={() => act(u.id, "warn")}>Warn</button>
                  <button onClick={() => act(u.id, "restrict")}>Restrict</button>
                  <button onClick={() => act(u.id, "block")}>Block</button>
                  <button onClick={() => act(u.id, "unblock")}>Unblock</button>
                  <button className="text-red-600" onClick={() => act(u.id, "delete")}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
