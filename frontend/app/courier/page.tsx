"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPinned, Navigation, Package, Phone, UserRound } from "lucide-react";
import { api, mediaUrl, money } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/lib/i18n";
import { TajikistanMap, type MapLoad } from "@/components/courier/TajikistanMap";
import { toast } from "@/components/ui/Toast";

type Load = MapLoad & {
  fullName: string;
  phone: string;
  address: string;
  total: number | string;
  deliveryMethod: string;
  payment?: { method: string; status: string };
  items: { id: string; name: string; quantity: number; price: number | string; product?: { images?: { url: string }[] } }[];
};

export default function CourierPage() {
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
      <section className="overflow-hidden rounded-3xl bg-[#0b1f4b] shadow-lift ring-1 ring-black/10">
        <div className="flex items-center justify-between px-5 py-3 text-white">
          <p className="text-sm font-semibold">{t("tajikistanMap")}</p>
          <p className="text-xs text-blue-100">{t("tapLoad")}</p>
        </div>
        <div className="h-[420px] bg-[#0b1f4b] md:h-[560px]">
          <TajikistanMap
            loads={loads}
            origin={origin}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </section>

      <aside className="flex min-h-[420px] flex-col rounded-3xl border border-border bg-white shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t("nearest")}</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{t("courierTitle")}</h2>
        </div>
        <ul className="max-h-40 overflow-y-auto border-b border-border">
          {loads.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setSelectedId(l.id)}
                className={`flex min-h-12 w-full items-center justify-between gap-3 px-5 text-left text-sm ${
                  l.id === selectedId ? "bg-primary/5 font-semibold text-primary" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">#{l.number} · {l.city}</span>
                <span className="shrink-0 tabular-nums text-xs text-slate-500">{l.km} {t("kmAway")}</span>
              </button>
            </li>
          ))}
          {!loads.length && <li className="px-5 py-8 text-sm text-muted-foreground">{t("loadsEmpty")}</li>}
        </ul>

        {selected ? (
          <div className="flex flex-1 flex-col px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t("customerOrder")}</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <Icon icon={UserRound} className="h-4 w-4 text-slate-400" /> {selected.fullName}
              </p>
              <a className="flex items-center gap-2 text-primary" href={`tel:${selected.phone}`}>
                <Icon icon={Phone} className="h-4 w-4" /> {selected.phone}
              </a>
              <p className="flex items-start gap-2 text-slate-600">
                <Icon icon={MapPinned} className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <span className="font-medium text-ink">{t("dropAt")}:</span> {selected.city}, {selected.address}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <Icon icon={Navigation} className="h-4 w-4 text-slate-400" /> {selected.km} {t("kmAway")} · #{selected.number}
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {selected.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
                  {item.product?.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(item.product.images[0].url)} alt="" className="h-10 w-10 rounded-lg object-cover" />
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
