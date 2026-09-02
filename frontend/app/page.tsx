"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getOnce, mediaUrl } from "@/lib/api";
import { ProductGrid } from "@/components/home/ProductGrid";
import { FlashDeals } from "@/components/home/FlashDeals";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
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
              <Link
                key={c.id}
                href={`/search?category=${c.slug}`}
                className="group block overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-black/[0.04] transition hover:shadow-md"
              >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    {c.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(c.image)}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <p className="px-2 py-2.5 text-center text-sm font-medium tracking-tight text-ink">{c.name}</p>
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
