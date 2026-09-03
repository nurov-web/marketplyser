"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getOnce } from "@/lib/api";
import { ProductGrid } from "@/components/home/ProductGrid";
import { FlashDeals } from "@/components/home/FlashDeals";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import dynamic from "next/dynamic";
import { FadeIn, Stagger } from "@/components/motion/FadeIn";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { SafeImg } from "@/components/ui/SafeImg";
import type { Category, Product } from "@/types";

const RecentlyViewed = dynamic(() => import("@/components/home/RecentlyViewed").then((m) => m.RecentlyViewed));
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((m) => m.Testimonials));
const Faq = dynamic(() => import("@/components/home/Faq").then((m) => m.Faq));

export default function HomePage() {
  const { t } = useI18n();
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

  return (
    <div>
      <HeroSlideshow />

      <FadeIn className="container-n mt-block">
        <h2 className="section-title mb-6">{t("categories")}</h2>
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
              <Link
                key={c.id}
                href={`/search?category=${c.slug}`}
                className="surface-card group block overflow-hidden rounded-xl"
              >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200/70">
                    {c.image && (
                      <SafeImg
                        src={c.image}
                        alt={c.name}
                        className="h-full w-full object-cover transition duration-[600ms] ease-out motion-safe:group-hover:scale-[1.07]"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <p className="px-2 py-2.5 text-center text-sm font-semibold tracking-tight text-ink transition-colors group-hover:text-primary-700">
                    {c.name}
                  </p>
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
        <h2 className="section-title">{t("trustTitle")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="surface-card p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary/15">
              <Icon icon={ShieldCheck} className="h-6 w-6 text-primary" aria-hidden />
            </span>
            <h3 className="mt-4 text-xl font-bold">{t("trustSafety")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("trustSafetyText")}</p>
          </article>
          <article className="surface-card bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-7 text-ink ring-amber-500/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/35 ring-1 ring-white/50">
              <Icon icon={Truck} className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-4 text-xl font-bold">{t("trustPay")}</h3>
            <p className="mt-2 text-sm leading-6 text-amber-950/85">{t("trustPayText")}</p>
          </article>
          <article className="surface-card bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#0ea5e9] p-7 text-white ring-primary/30">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Icon icon={Sparkles} className="h-6 w-6 text-amber-300" aria-hidden />
            </span>
            <h3 className="mt-4 text-xl font-bold">{t("trustSupport")}</h3>
            <p className="mt-2 text-sm leading-6 text-blue-50/90">{t("trustSupportText")}</p>
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
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[1.75rem] bg-slate-900 px-8 py-12 text-white md:flex-row md:items-center md:px-12">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/35 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-28 left-4 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-bold md:text-4xl">{t("sellerCtaTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">{t("sellerCtaText")}</p>
          </div>
          <Link href="/search" className="btn-accent relative shrink-0">
            {t("viewProducts")} <Icon icon={ArrowRight} className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
