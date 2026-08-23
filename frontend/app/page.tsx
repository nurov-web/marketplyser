"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getOnce, mediaUrl } from "@/lib/api";
import { ProductGrid } from "@/components/home/ProductGrid";
import { FlashDeals } from "@/components/home/FlashDeals";
import dynamic from "next/dynamic";
import { FadeIn, Stagger } from "@/components/motion/FadeIn";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import type { Category, Product } from "@/types";

const RecentlyViewed = dynamic(() => import("@/components/home/RecentlyViewed").then((m) => m.RecentlyViewed));
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((m) => m.Testimonials));
const Faq = dynamic(() => import("@/components/home/Faq").then((m) => m.Faq));

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [sections, setSections] = useState<{
    new: Product[];
    popular: Product[];
    deals: Product[];
  } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      getOnce<{ items: Category[] }>("/api/categories"),
      getOnce<{ new: Product[]; popular: Product[]; deals: Product[] }>("/api/products/home/sections"),
    ])
      .then(([c, s]) => {
        setCats(c.items || []);
        setSections(s);
        setError(false);
      })
      .catch(() => {
        setCats([]);
        setSections({ new: [], popular: [], deals: [] });
        setError(true);
      })
      .finally(() => setLoaded(true));
  }, []);

  function goSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div>
      <section className="container-n mt-6">
        <div
          className="hero-pattern relative overflow-hidden rounded-[2rem] px-6 py-14 text-white md:px-14 md:py-20"
          style={{ backgroundColor: "#0b1f4b" }}
        >
          <div className="relative grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="kicker">{t("heroKicker")}</p>
              <h1 className="mt-4 max-w-xl text-4xl font-bold leading-[1.1] text-white md:text-5xl">{t("heroTitle")}</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-blue-100">{t("heroText")}</p>
              <form onSubmit={goSearch} className="relative mt-8 max-w-xl">
                <label className="sr-only" htmlFor="hero-search">{t("searchAria")}</label>
                <Icon icon={Search} className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  id="hero-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("heroSearch")}
                  className="h-14 rounded-full border-0 pl-12 text-base text-ink shadow-lift"
                />
              </form>
              <div className="relative mt-6 flex flex-wrap gap-3">
                <Link href="/search" className="btn-primary">
                  {t("viewProducts")} <Icon icon={ArrowRight} className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="relative mt-8 grid max-w-xl grid-cols-3 gap-3 text-xs md:text-sm">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-900">
                    <Icon icon={ShieldCheck} className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-white">{t("verifiedSeller")}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-300 text-slate-900">
                    <Icon icon={Truck} className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-white">{t("delivery")}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700">
                    <Icon icon={Sparkles} className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-white">{t("fairPrice")}</p>
                </div>
              </div>
            </div>

            {(() => {
              const featured = sections?.popular?.[0];
              const href = featured?.id ? `/product/${featured.id}` : "/search";
              return (
                <Link
                  href={href}
                  className="group relative hidden md:block"
                  aria-label={featured?.name ? featured.name : t("viewProducts")}
                >
                  <div className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" aria-hidden />
                  <div className="pointer-events-none absolute -bottom-10 right-10 h-36 w-36 rounded-full bg-amber-400/25 blur-3xl" aria-hidden />
                  <div className="relative mx-auto w-[280px] rotate-3 rounded-3xl bg-white p-3 text-ink shadow-lift transition duration-300 group-hover:-rotate-1 group-hover:scale-[1.03] group-hover:shadow-card">
                    <div className="h-44 overflow-hidden rounded-2xl bg-slate-100">
                      {featured?.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(featured.images[0].url)} alt={featured.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-sky-200" />
                      )}
                    </div>
                    <p className="mt-3 line-clamp-1 text-sm font-semibold">{featured?.name || "Nurov"}</p>
                    <p className="mt-1 text-xs text-slate-500">{t("popular")}</p>
                  </div>
                  <div className="absolute -left-4 bottom-6 w-44 -rotate-6 rounded-2xl bg-white/95 p-3 text-ink shadow-card transition duration-300 group-hover:rotate-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Icon icon={ShieldCheck} className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-xs font-semibold">{t("verifiedSeller")}</p>
                        <p className="text-[11px] text-slate-500">Nurov</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        </div>
      </section>

      <FadeIn className="container-n mt-block">
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">{t("categories")}</h2>
        {!loaded ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-square" />)}
          </div>
        ) : !cats.length || error ? (
          <div className="rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-soft">
            <p className="text-sm text-muted-foreground">{t("emptyCategories")}</p>
            <Link href="/search" className="btn-primary mt-5">
              {t("viewProducts")}
            </Link>
          </div>
        ) : (
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-8">
            {cats.map((c) => (
              <Link key={c.id} href={`/search?category=${c.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-soft">
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    {c.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(c.image)} alt={c.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    )}
                  </div>
                  <p className="px-2 py-2 text-center text-sm font-medium">{c.name}</p>
                </Link>
            ))}
          </Stagger>
        )}
      </FadeIn>

      {!loaded ? (
        <div className="container-n mt-block grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-12">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-64" />)}
        </div>
      ) : error || !sections || !(sections.new.length || sections.popular.length || sections.deals.length) ? (
        <div className="container-n mt-block">
          <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
            <p className="text-lg font-semibold text-ink">{t("emptyHome")}</p>
            <Link href="/search" className="btn-primary mt-6">
              {t("viewProducts")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <FlashDeals products={sections.deals} />
          <ProductGrid title={t("popular")} products={sections.popular} href="/search" eager />
          <ProductGrid title={t("newest")} products={sections.new} href="/search" />
          <RecentlyViewed />
        </>
      )}

      <FadeIn className="container-n mt-block">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("trustTitle")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-7 shadow-soft">
            <Icon icon={ShieldCheck} className="h-8 w-8 text-primary" aria-hidden />
            <h3 className="mt-4 text-xl font-bold">{t("trustSafety")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("trustSafetyText")}</p>
          </article>
          <article className="rounded-2xl bg-accent p-7 text-ink shadow-soft">
            <Icon icon={Truck} className="h-8 w-8" aria-hidden />
            <h3 className="mt-4 text-xl font-bold">{t("trustPay")}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-800">{t("trustPayText")}</p>
          </article>
          <article className="rounded-2xl bg-primary p-7 text-white shadow-soft">
            <Icon icon={Sparkles} className="h-8 w-8 text-accent" aria-hidden />
            <h3 className="mt-4 text-xl font-bold">{t("trustSupport")}</h3>
            <p className="mt-2 text-sm leading-6 text-blue-100">{t("trustSupportText")}</p>
          </article>
        </div>
      </FadeIn>

      <FadeIn>
        <Testimonials />
      </FadeIn>

      <FadeIn>
        <Faq />
      </FadeIn>

      <FadeIn className="container-n mt-block mb-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-slate-900 px-8 py-12 text-white md:flex-row md:items-center md:px-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold md:text-4xl">{t("sellerCtaTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">{t("sellerCtaText")}</p>
          </div>
          <Link href="/search" className="btn-primary shrink-0">
            {t("viewProducts")} <Icon icon={ArrowRight} className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
