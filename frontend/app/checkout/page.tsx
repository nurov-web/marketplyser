"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { api, money } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/lib/i18n";

type Addr = { id: string; fullName: string; phone: string; city: string; address: string; isDefault: boolean };
type GeoStatus = "idle" | "asking" | "ok" | "denied";

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function readGps(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 }
    );
  });
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { open } = useAuthModal();
  const { t } = useI18n();
  const router = useRouter();
  const { items, subtotal, refresh } = useCart();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponOff, setCouponOff] = useState(0);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "Душанбе",
    address: "",
    deliveryMethod: "STANDARD",
    paymentMethod: "COD",
    saveAddress: true,
    couponCode: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      open("login", { next: "/checkout" });
      return;
    }
    setForm((f) => ({
      ...f,
      firstName: f.firstName || user.firstName || "",
      lastName: f.lastName || user.lastName || "",
      phone: f.phone || (user.phone?.startsWith("g") ? "" : user.phone || ""),
    }));
    api<{ items: Addr[] }>("/api/addresses")
      .then((d) => {
        setAddresses(d.items);
        const def = d.items.find((a) => a.isDefault) || d.items[0];
        if (def) {
          const n = splitName(def.fullName);
          setForm((f) => ({
            ...f,
            firstName: n.firstName || f.firstName,
            lastName: n.lastName || f.lastName,
            phone: def.phone,
            city: def.city,
            address: def.address,
          }));
        }
      })
      .catch(() => {});
  }, [user, loading, open]);

  const deliveryFee = form.deliveryMethod === "EXPRESS" ? 15 : form.deliveryMethod === "PICKUP" ? 0 : 5;
  const payTotal = Math.max(0, subtotal + deliveryFee - couponOff);

  async function applyCoupon() {
    try {
      const d = await api<{ discount: number; code: string }>("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: coupon, subtotal }),
      });
      setCouponOff(d.discount);
      setForm((f) => ({ ...f, couponCode: d.code }));
      toast(`Купон ${d.code}: -${d.discount} с.`);
    } catch (err) {
      setCouponOff(0);
      setForm((f) => ({ ...f, couponCode: "" }));
      toast(err instanceof Error ? err.message : "Купон нодуруст", "err");
    }
  }

  async function askLocation() {
    if (form.deliveryMethod === "PICKUP") return null;
    setGeoStatus("asking");
    const point = await readGps();
    if (point) {
      setGeo(point);
      setGeoStatus("ok");
      return point;
    }
    setGeoStatus("denied");
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      open("login", { next: "/checkout" });
      setError(t("checkoutNeedLogin"));
      return;
    }
    if (!items.length) {
      setError("Сабад холӣ аст");
      return;
    }
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (firstName.length < 2) {
      setError("Номро нависед");
      return;
    }
    if (lastName.length < 1) {
      setError("Насабро нависед");
      return;
    }
    if (form.phone.trim().length < 7) {
      setError("Рақами телефон нодуруст аст");
      return;
    }
    if (form.address.trim().length < 5) {
      setError("Суроғаро пурра нависед");
      return;
    }
    setError("");
    setBusy(true);
    try {
      let point = geo;
      if (form.deliveryMethod !== "PICKUP" && !point) {
        point = await askLocation();
      }
      const order = await api<{ id: string }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          firstName,
          lastName,
          fullName,
          lat: point?.lat,
          lng: point?.lng,
        }),
      });
      await refresh();
      toast("Фармоиш қабул шуд");
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
      setBusy(false);
    }
  }

  const composedName = `${form.firstName} ${form.lastName}`.trim();
  const selectedAddr = addresses.find(
    (a) => a.fullName === composedName && a.city === form.city && a.address === form.address
  );

  return (
    <div className="container-n py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">{t("checkout")}</h1>
        {!user && !loading && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
            {t("checkoutNeedLogin")}
          </p>
        )}
        <form onSubmit={submit} className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
          <div className="min-w-0 space-y-4 rounded-2xl border border-border bg-white p-5 shadow-soft md:p-6">
            {addresses.length > 0 && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Суроғаҳои захирашуда</legend>
                <div className="space-y-2">
                  {addresses.map((a) => {
                    const on = selectedAddr?.id === a.id;
                    return (
                      <button
                        type="button"
                        key={a.id}
                        className={`min-h-11 w-full rounded-xl border p-3 text-left text-sm motion-safe:transition-opacity motion-safe:duration-200 ${
                          on ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                        }`}
                        onClick={() => {
                          const n = splitName(a.fullName);
                          setForm((f) => ({
                            ...f,
                            firstName: n.firstName,
                            lastName: n.lastName,
                            phone: a.phone,
                            city: a.city,
                            address: a.address,
                          }));
                        }}
                      >
                        {a.fullName} · {a.city}, {a.address}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  {t("firstName")} <span className="text-red-700">*</span>
                </span>
                <input
                  required
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  {t("lastName")} <span className="text-red-700">*</span>
                </span>
                <input
                  required
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Телефон <span className="text-red-700">*</span>
              </span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+992 90 000 0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Шаҳр <span className="text-red-700">*</span>
              </span>
              <input
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Суроға <span className="text-red-700">*</span>
              </span>
              <textarea
                required
                autoComplete="street-address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Усули расонидан</span>
              <select
                value={form.deliveryMethod}
                onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}
              >
                <option value="STANDARD">Стандартӣ (5 с.)</option>
                <option value="EXPRESS">Экспресс (15 с.)</option>
                <option value="PICKUP">Гирифтан аз дӯкон (0)</option>
              </select>
            </label>
            {form.deliveryMethod !== "PICKUP" && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <p className="text-sm font-medium text-sky-950">{t("askLocation")}</p>
                <p className="mt-1 text-xs text-sky-800">
                  {geoStatus === "ok" && geo
                    ? `${t("locationOk")} (${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)})`
                    : geoStatus === "denied"
                      ? t("locationSkip")
                      : t("splash2Text")}
                </p>
                <button
                  type="button"
                  className="btn-primary mt-3 min-h-11"
                  disabled={geoStatus === "asking" || geoStatus === "ok"}
                  onClick={() => {
                    void askLocation();
                  }}
                >
                  {geoStatus === "asking" ? "..." : geoStatus === "ok" ? t("locationOk") : t("locationAllow")}
                </button>
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Усули пардохт</span>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="COD">Пардохт ҳангоми расонидан</option>
                <option value="CARD">Корт (озмоишӣ)</option>
                <option value="ONLINE">Пардохти онлайн (озмоишӣ)</option>
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Купон</span>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  placeholder="Масалан NUROV10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  aria-describedby="coupon-hint"
                />
                <button type="button" className="btn-ghost shrink-0" onClick={applyCoupon}>
                  Татбиқ
                </button>
              </div>
              <p id="coupon-hint" className="mt-1.5 text-xs text-muted-foreground">
                Купонҳо: NUROV10 · SALE20 · WELCOME
              </p>
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="!h-4 !w-4 shrink-0 !rounded !p-0"
                checked={form.saveAddress}
                onChange={(e) => setForm({ ...form, saveAddress: e.target.checked })}
              />
              Суроғаро нигоҳ дор
            </label>
            {error && (
              <p className="text-sm text-red-700" role="alert" tabIndex={-1}>
                {error}
              </p>
            )}
          </div>

          <aside className="h-fit min-w-0 rounded-2xl border border-border bg-white p-5 shadow-soft md:sticky md:top-24">
            <h2 className="text-sm font-semibold text-ink">{t("orders")}</h2>
            <div className="mt-3 space-y-2">
              {items.map((i) => (
                <p key={i.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    {i.product.name} × {i.quantity}
                  </span>
                  <span className="shrink-0 tabular-nums">{money(i.lineTotal)}</span>
                </p>
              ))}
              {!items.length && (
                <div className="py-4 text-center">
                  <Icon icon={ShoppingBag} className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
                  <p className="mt-2 text-sm text-muted-foreground">Сабад холӣ аст</p>
                  <Link href="/search" className="mt-3 inline-block text-sm font-semibold text-primary">
                    Ба каталог
                  </Link>
                </div>
              )}
            </div>
            <p className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Ҷамъи мол</span>
              <span className="tabular-nums">{money(subtotal)}</span>
            </p>
            <p className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Расонидан</span>
              <span className="tabular-nums">{money(deliveryFee)}</span>
            </p>
            {couponOff > 0 && (
              <p className="mt-1 flex justify-between text-sm text-primary">
                <span>Купон</span>
                <span className="tabular-nums">−{money(couponOff)}</span>
              </p>
            )}
            <p className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
              <span>Ҷамъ</span>
              <span className="tabular-nums">{money(payTotal)}</span>
            </p>
            <button type="submit" className="btn-accent mt-5 w-full" disabled={busy || !items.length}>
              {busy ? "Фиристода мешавад..." : t("checkout")}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
