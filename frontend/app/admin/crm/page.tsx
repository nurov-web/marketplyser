"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FadeIn } from "@/components/motion/FadeIn";

type Tab = "contacts" | "leads" | "deals";

export default function CrmPage() {
  const [tab, setTab] = useState<Tab>("leads");
  const [data, setData] = useState<any>({ contacts: [], leads: [], deals: [], bitrixConfigured: false });
  const [msg, setMsg] = useState("");

  function load() {
    api("/api/admin/crm").then(setData).catch((e) => setMsg(e.message));
  }
  useEffect(() => {
    load();
  }, []);

  async function add(type: string) {
    const name = prompt("Ном / Name") || "";
    if (!name) return;
    const phone = prompt("Телефон") || "";
    await api("/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({
        type,
        name,
        phone,
        title: name,
        email: "",
        amount: type === "deal" ? 0 : undefined,
      }),
    });
    load();
  }

  async function sync() {
    try {
      const r = await api<{ synced: number }>("/api/admin/crm/sync-bitrix", { method: "POST" });
      setMsg(`Bitrix: ${r.synced} лид`);
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Bitrix webhook нест");
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "leads", label: "Лиды / Лидҳо" },
    { id: "contacts", label: "Контакты" },
    { id: "deals", label: "Сделки" },
  ];

  return (
    <FadeIn>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">CRM · Bitrix</h1>
          <p className="mt-1 text-sm text-slate-500">Таблицаҳои лид, контакт ва сделка (монанди Bitrix24)</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs" onClick={() => add(tab === "contacts" ? "contact" : tab === "deals" ? "deal" : "lead")}>
            + Сатр
          </button>
          <button className="btn-gold text-xs" onClick={sync}>
            Sync Bitrix24
          </button>
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-amber-700">{msg}</p>}
      <div className="mt-4 flex gap-1 rounded-xl bg-slate-200/70 p-1 text-sm">
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={`rounded-lg px-4 py-2 ${tab === x.id ? "bg-white shadow-sm" : "text-slate-600"}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {tab === "leads" && (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#535c69] text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="p-3">Title</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Source</th>
                <th>Bitrix ID</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td>{r.name}</td>
                  <td>{r.phone}</td>
                  <td>
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-800">{r.status}</span>
                  </td>
                  <td>{r.source}</td>
                  <td className="text-xs text-slate-400">{r.bitrixId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "contacts" && (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#535c69] text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="p-3">Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td>{r.phone}</td>
                  <td>{r.email}</td>
                  <td>{r.company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "deals" && (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#535c69] text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="p-3">Title</th>
                <th>Amount</th>
                <th>Stage</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {data.deals.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td>{r.amount}</td>
                  <td>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">{r.stage}</span>
                  </td>
                  <td>{r.contact?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Барои синхрон: BITRIX_WEBHOOK_URL=https://your.bitrix24.ru/rest/1/xxxxx/ дар backend/.env
      </p>
    </FadeIn>
  );
}
