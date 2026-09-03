"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MapPinned, Navigation, Package, Phone, UserRound } from "lucide-react";
import { api, money } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { SafeImg } from "@/components/ui/SafeImg";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { TajikistanMap, type MapLoad } from "@/components/courier/TajikistanMap";
import { toast } from "@/components/ui/Toast";

type Load = MapLoad & {
  phone: string;
  address: string;
  total: number | string;
  deliveryMethod: string;
  payment?: { method: string; status: string };
  user?: { firstName: string; lastName: string; phone: string };
  items: { id: string; name: string; quantity: number; price: number | string; product?: { images?: { url: string }[] } }[];
};

function customerName(load: Load) {
  if (load.fullName?.trim()) return load.fullName.trim();
  const u = load.user;
  if (u) return `${u.firstName} ${u.lastName}`.trim();
  return "—";
}

export default function CourierPage() {
  const { user } = useAuth();
  if (user && user.role !== "COURIER" && user.role !== "ADMIN") {
    return <CourierApplyGate />;
  }
  return <CourierDesk />;
}

function CourierApplyGate() {
  const { user, courierApply, refresh } = useAuth();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    phone: user?.phone?.startsWith("g") ? "" : user?.phone || "",
    city: "Душанбе",
    vehicle: "Мотоцикл",
    message: "",
  });

  useEffect(() => {
    if (courierApply?.status !== "PENDING") return;
    const id = window.setInterval(() => {
      refresh().catch(() => {});
    }, 8000);
    return () => window.clearInterval(id);
  }, [courierApply?.status, refresh]);

  if (courierApply?.status === "PENDING") {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-white p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">{t("courierPending")}</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">{t("courierApplyTitle")}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("courierPendingText")}</p>
      </div>
    );
  }

  if (courierApply?.status === "APPROVED") {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-white p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("courierApprovedWait")}</p>
        <button type="button" className="btn-primary mt-4" onClick={() => refresh()}>
          {t("courierReload")}
        </button>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/courier/apply", { method: "POST", body: JSON.stringify(form) });
      toast(t("courierApplySent"));
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4 rounded-3xl border border-border bg-white p-6 shadow-soft md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t("courierApplyTitle")}</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">{t("becomeCourier")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("courierApplyText")}</p>
        {courierApply?.status === "REJECTED" && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {t("courierRejected")}: {courierApply.rejectReason || t("courierRejected")}
          </p>
        )}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("fullName")}</span>
        <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("phone")}</span>
        <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("city")}</span>
        <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("vehicle")}</span>
        <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
          <option value="Мотоцикл">Мотоцикл</option>
          <option value="Мошин">Мошин</option>
          <option value="Велосипед">Велосипед</option>
          <option value="Пиёда">Пиёда</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t("courierNote")}</span>
        <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </label>
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "..." : t("sendApply")}
      </button>
    </form>
  );
}

function CourierDesk() {
  const { t } = useI18n();
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(lat?: number, lng?: number) {
    const q = lat && lng ? `?lat=${lat}&lng=${lng}` : "";
    const d = await api<{ origin: { lat: number; lng: number }; items: Load[] }>(`/api/courier/loads${q}`);
    setOrigin(d.origin);
    setLoads(d.items);
    setSelectedId((cur) => cur || d.items[0]?.id || null);
  }

  useEffect(() => {
    let gone = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (gone) return;
          load(pos.coords.latitude, pos.coords.longitude).catch(() => {});
        },
        () => {
          if (!gone) load().catch(() => {});
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      load().catch(() => {});
    }
    return () => {
      gone = true;
    };
  }, []);

  const selected = useMemo(() => loads.find((l) => l.id === selectedId) || null, [loads, selectedId]);

  async function act(action: "pickup" | "deliver") {
    if (!selected) return;
    setBusy(true);
    try {
      await api(`/api/courier/loads/${selected.id}`, { method: "PATCH", body: JSON.stringify({ action }) });
      toast(action === "deliver" ? t("markDelivered") : t("markPicked"));
      await load(origin?.lat, origin?.lng);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
      <section className="overflow-hidden rounded-3xl bg-[#c9d6b8] shadow-lift ring-1 ring-black/10">
        <div className="flex items-center justify-between bg-[#1e3a2a] px-5 py-3 text-white">
          <p className="text-sm font-semibold">{t("deliveryPlaces")}</p>
          <p className="text-xs text-emerald-100">{t("tapLoad")}</p>
        </div>
        <div className="h-[420px] md:h-[560px]">
          <TajikistanMap
            loads={loads.map((l) => ({ ...l, fullName: customerName(l) }))}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </section>

      <aside className="flex min-h-[420px] flex-col rounded-3xl border border-border bg-white shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t("orderedPeople")}</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{t("courierTitle")}</h2>
        </div>
        <ul className="max-h-52 overflow-y-auto border-b border-border">
          {loads.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setSelectedId(l.id)}
                className={`flex min-h-12 w-full items-start justify-between gap-3 px-5 py-3 text-left ${
                  l.id === selectedId ? "bg-primary/5 text-primary" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0">
                  <span className={`block truncate text-sm ${l.id === selectedId ? "font-semibold" : "font-medium"}`}>
                    {customerName(l)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{l.phone}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {l.city}{l.address ? `, ${l.address}` : ""}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5 text-right text-xs tabular-nums text-slate-500">
                  {l.km} {t("kmAway")}
                  <span className="mt-0.5 block">#{l.number}</span>
                </span>
              </button>
            </li>
          ))}
          {!loads.length && <li className="px-5 py-8 text-sm text-muted-foreground">{t("loadsEmpty")}</li>}
        </ul>

        {selected ? (
          <div className="flex flex-1 flex-col px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t("customerOrder")}</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-lg font-bold text-ink">
                <Icon icon={UserRound} className="h-5 w-5 text-slate-400" /> {customerName(selected)}
              </p>
              <a className="flex items-center gap-2 font-medium text-primary" href={`tel:${selected.phone}`}>
                <Icon icon={Phone} className="h-4 w-4" /> {selected.phone}
              </a>
              <p className="flex items-start gap-2 text-slate-600">
                <Icon icon={MapPinned} className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <span className="font-medium text-ink">{t("dropAt")}:</span> {selected.city}, {selected.address}
                </span>
              </p>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Icon icon={Navigation} className="h-4 w-4 text-slate-400" /> {selected.km} {t("kmAway")} · #{selected.number}
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {selected.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
                  {item.product?.images?.[0]?.url ? (
                    <SafeImg src={item.product.images[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                      <Icon icon={Package} className="h-4 w-4 text-slate-400" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{item.name} × {item.quantity}</span>
                  <span className="text-sm font-semibold tabular-nums">{money(item.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between text-sm font-bold">
              <span>{t("checkout")}</span>
              <span className="tabular-nums">{money(selected.total)}</span>
            </p>
            <div className="mt-auto flex gap-2 pt-5">
              <button type="button" className="btn-ghost flex-1" disabled={busy} onClick={() => act("pickup")}>
                {t("markPicked")}
              </button>
              <button type="button" className="btn-primary flex-1" disabled={busy} onClick={() => act("deliver")}>
                {t("markDelivered")}
              </button>
            </div>
          </div>
        ) : (
          <p className="px-5 py-10 text-sm text-muted-foreground">{t("loadsEmpty")}</p>
        )}
      </aside>
    </div>
  );
}
