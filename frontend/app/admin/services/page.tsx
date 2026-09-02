"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FadeIn } from "@/components/motion/FadeIn";

type Provider = {
  id: string;
  name: string;
  phone: string;
  city: string;
  status: string;
  isFeatured: boolean;
  category: { name: string };
};

type Request = {
  id: string;
  customerName: string;
  phone: string;
  message: string;
  status: string;
  bitrixLeadId: string | null;
  provider: Provider;
};

export default function AdminServicesPage() {
  const [tab, setTab] = useState<"requests" | "providers">("requests");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  function load() {
    api<{ items: Provider[] }>("/api/services/admin/providers").then((d) => setProviders(d.items));
    api<{ items: Request[] }>("/api/services/admin/requests").then((d) => setRequests(d.items));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateProvider(id: string, status: string, isFeatured?: boolean) {
    await api(`/api/services/admin/providers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, isFeatured }),
    });
    load();
  }

  async function updateRequest(id: string, status: string) {
    await api(`/api/services/admin/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <FadeIn>
      <h1 className="text-2xl font-bold">Хизматҳои маҳаллӣ</h1>
      <p className="mt-1 text-sm text-muted-foreground">Megasavdo — хизматрасонҳо ва фармоишҳо</p>

      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => setTab("requests")} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "requests" ? "bg-primary text-white" : "bg-white ring-1 ring-border"}`}>
          Фармоишҳо ({requests.length})
        </button>
        <button type="button" onClick={() => setTab("providers")} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "providers" ? "bg-primary text-white" : "bg-white ring-1 ring-border"}`}>
          Хизматрасонҳо ({providers.length})
        </button>
      </div>

      {tab === "requests" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Муштарӣ</th>
                <th className="px-4 py-3">Хизматрасон</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Bitrix</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <div>{r.customerName}</div>
                    <div className="text-muted-foreground">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3">{r.provider?.name}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={(e) => updateRequest(r.id, e.target.value)} className="rounded-lg border border-border px-2 py-1">
                      <option value="NEW">Нав</option>
                      <option value="CONFIRMED">Тасдиқ</option>
                      <option value="COMPLETED">Анҷом</option>
                      <option value="CANCELLED">Бекор</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.bitrixLeadId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "providers" && (
        <div className="mt-6 grid gap-3">
          {providers.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.category?.name} · {p.city}</p>
                  <p className="text-sm">{p.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={p.status} onChange={(e) => updateProvider(p.id, e.target.value)} className="rounded-lg border border-border px-2 py-1 text-sm">
                    <option value="PENDING">Интизор</option>
                    <option value="ACTIVE">Фаъол</option>
                    <option value="BLOCKED">Банд</option>
                  </select>
                  <button type="button" onClick={() => updateProvider(p.id, p.status, !p.isFeatured)} className={`rounded-lg px-3 py-1 text-sm font-medium ${p.isFeatured ? "bg-amber-100 text-amber-800" : "bg-slate-100"}`}>
                    {p.isFeatured ? "★ Featured" : "Featured"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FadeIn>
  );
}
