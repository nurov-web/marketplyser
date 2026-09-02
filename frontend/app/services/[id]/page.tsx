"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type ServiceProvider = {
  id: string;
  name: string;
  phone: string;
  city: string;
  description: string;
  priceFrom: number;
  isFeatured: boolean;
  category: { name: string };
};

export default function ServiceDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = String(params.id);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<ServiceProvider>(`/api/services/providers/${id}`)
      .then(setProvider)
      .catch(() => setProvider(null));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/services/requests", {
        method: "POST",
        body: JSON.stringify({ providerId: id, customerName, phone, message }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хатогӣ");
    } finally {
      setLoading(false);
    }
  }

  if (!provider) {
    return <div className="container-n py-16 text-center text-muted-foreground">Боргирӣ...</div>;
  }

  return (
    <div className="container-n py-8">
      <Link href="/services" className="text-sm font-medium text-primary hover:underline">← {t("servicesTitle")}</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          {provider.isFeatured && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Featured</span>
          )}
          <h1 className="mt-3 text-2xl font-bold">{provider.name}</h1>
          <p className="text-primary">{provider.category.name}</p>
          <p className="mt-4 text-muted-foreground">{provider.description}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between border-b border-border/60 pb-2">
              <dt className="text-muted-foreground">Шаҳр</dt>
              <dd className="font-medium">{provider.city}</dd>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <dt className="text-muted-foreground">Телефон</dt>
              <dd className="font-medium">{provider.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Нарх</dt>
              <dd className="font-bold text-primary">аз {provider.priceFrom} сомонӣ</dd>
            </div>
          </dl>
        </div>

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="text-lg font-semibold text-emerald-800">{t("servicesOrderOk")}</p>
            <button type="button" onClick={() => setSuccess(false)} className="mt-4 text-sm text-emerald-700 underline">
              Фармоиши дигар
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold">{t("servicesOrder")}</h2>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-4 space-y-3">
              <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ном" className="h-11 w-full rounded-xl border border-border px-3" />
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+992 90 123 4567" className="h-11 w-full rounded-xl border border-border px-3" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Тавсиф" className="w-full rounded-xl border border-border px-3 py-2" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">
              {loading ? "..." : t("servicesOrderSubmit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
