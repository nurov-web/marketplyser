"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Search, Sparkles, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/lib/i18n";

type ServiceCategory = { id: string; name: string; slug: string; icon: string };
type ServiceProvider = {
  id: string;
  name: string;
  phone: string;
  city: string;
  description: string;
  priceFrom: number;
  isFeatured: boolean;
  category: ServiceCategory;
};

const iconMap: Record<string, typeof Wrench> = {
  wrench: Wrench,
  scissors: Wrench,
  hammer: Wrench,
  book: Wrench,
  sparkles: Sparkles,
};

export default function ServicesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [items, setItems] = useState<ServiceProvider[]>([]);
  const [featured, setFeatured] = useState<ServiceProvider[]>([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: ServiceCategory[]; cities: string[] }>("/api/services/categories")
      .then((d) => {
        setCategories(d.items || []);
        setCities(d.cities || []);
      })
      .catch(() => {});

    api<{ items: ServiceProvider[] }>("/api/services/providers?featured=true")
      .then((d) => setFeatured(d.items || []))
      .catch(() => setFeatured([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    api<{ items: ServiceProvider[] }>(`/api/services/providers?${params}`)
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [q, city, category]);

  useEffect(() => {
    const tmr = setTimeout(load, 300);
    return () => clearTimeout(tmr);
  }, [load]);

  return (
    <div className="container-n py-8">
      <div className="hero-pattern rounded-2xl px-6 py-10 text-white shadow-lift" style={{ backgroundColor: "#0b1f4b" }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Megasavdo</p>
        <h1 className="mt-2 text-3xl font-bold">{t("servicesTitle")}</h1>
        <p className="mt-2 max-w-2xl text-blue-100">{t("servicesText")}</p>
      </div>

      {featured.length > 0 && !q && !city && !category && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{t("servicesFeatured")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((p) => (
              <ServiceCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft md:grid-cols-3">
        <div className="relative">
          <Icon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("servicesSearch")}
            className="h-11 w-full rounded-xl border border-border pl-10 pr-3 text-sm"
          />
        </div>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl border border-border px-3 text-sm">
          <option value="">{t("servicesAllCities")}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl border border-border px-3 text-sm">
          <option value="">{t("servicesAllCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("servicesAll")}</h2>
        <span className="text-sm text-muted-foreground">{items.length} натиҷа</span>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-muted-foreground">Боргирӣ...</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">{t("emptySearch")}</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => <ServiceCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ provider }: { provider: ServiceProvider }) {
  const IconCmp = iconMap[provider.category?.icon] || Wrench;
  return (
    <Link
      href={`/services/${provider.id}`}
      className="rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:border-primary/40 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon icon={IconCmp} className="h-5 w-5" aria-hidden />
        </div>
        {provider.isFeatured && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Featured</span>
        )}
      </div>
      <h3 className="mt-3 font-semibold text-ink">{provider.name}</h3>
      <p className="text-sm text-primary">{provider.category?.name}</p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{provider.description}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Icon icon={MapPin} className="h-3.5 w-3.5" aria-hidden />
          {provider.city}
        </span>
        <span className="font-semibold">аз {provider.priceFrom} сомонӣ</span>
      </div>
    </Link>
  );
}
