"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Store, Wrench } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

type Slide = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  accent: string;
  glow: string;
};

export function HeroSlideshow() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides: Slide[] = [
    {
      id: "shop",
      kicker: t("heroKicker"),
      title: t("heroTitle"),
      text: t("heroText"),
      cta: t("viewProducts"),
      href: "/search",
      accent: "#0b1f4b",
      glow: "rgba(56,189,248,0.35)",
    },
    {
      id: "services",
      kicker: t("services"),
      title: t("servicesTitle"),
      text: t("servicesText"),
      cta: t("services"),
      href: "/services",
      accent: "#0f3d2e",
      glow: "rgba(52,211,153,0.35)",
    },
    {
      id: "shops",
      kicker: t("shops"),
      title: t("slideShopsTitle"),
      text: t("slideShopsText"),
      cta: t("shops"),
      href: "/shops",
      accent: "#3b1d0f",
      glow: "rgba(251,191,36,0.35)",
    },
  ];

  const count = slides.length;
  const slide = slides[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [paused, reduce, next]);

  return (
    <section className="container-n mt-6" aria-roledescription="carousel" aria-label="Hero">
      <div
        className="relative overflow-hidden rounded-2xl text-white sm:rounded-[2rem]"
        style={{ backgroundColor: slide.accent }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: slide.glow }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full blur-3xl opacity-70"
          style={{ background: slide.glow }}
          aria-hidden
        />

        <div className="relative min-h-[320px] px-5 py-10 sm:min-h-[380px] sm:px-6 sm:py-14 md:px-14 md:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  {slide.kicker}
                </p>
                <h1 className="mt-4 max-w-xl text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-white/80">{slide.text}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={slide.href} className="btn-primary">
                    {slide.cta} <Icon icon={ArrowRight} className="h-4 w-4" aria-hidden />
                  </Link>
                  {slide.id === "shop" && (
                    <Link
                      href="/services"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
                    >
                      {t("services")} <Icon icon={Wrench} className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
              </div>

              <div className="hidden justify-end md:flex" aria-hidden>
                <div className="relative flex h-52 w-52 items-center justify-center rounded-[2rem] bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                  <Icon
                    icon={slide.id === "services" ? Wrench : slide.id === "shops" ? Store : ArrowRight}
                    className="h-16 w-16 text-white/90"
                  />
                  <div className="absolute -left-4 bottom-6 rounded-2xl bg-white px-4 py-3 text-ink shadow-card">
                    <p className="text-xs font-semibold">{slide.kicker}</p>
                    <p className="text-[11px] text-slate-500">Nurov</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4 sm:bottom-6">
          <button
            type="button"
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
            aria-label={t("prev")}
          >
            <Icon icon={ChevronLeft} className="h-4 w-4" />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
            aria-label={paused ? t("play") : t("pause")}
          >
            <Icon icon={paused ? Play : Pause} className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
            aria-label={t("next")}
          >
            <Icon icon={ChevronRight} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
