"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
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
  statTitle: string;
  statText: string;
  statIcon: typeof ShoppingBag;
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
      statTitle: t("heroStatTitle"),
      statText: t("heroStatText"),
      statIcon: ShoppingBag,
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
      statTitle: t("servicesStatTitle"),
      statText: t("servicesStatText"),
      statIcon: Wrench,
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
      statTitle: t("shopsStatTitle"),
      statText: t("shopsStatText"),
      statIcon: Store,
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
      <motion.div
        className="relative overflow-hidden rounded-2xl text-white sm:rounded-[2rem]"
        style={{ backgroundColor: slide.accent }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="relative min-h-[320px] px-5 py-10 pb-20 sm:min-h-[380px] sm:px-6 sm:py-14 sm:pb-20 md:px-14 md:py-16">
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
                <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-ink shadow-card md:hidden">
                  <p className="text-xs font-semibold">{slide.statTitle}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{slide.statText}</p>
                </div>
              </div>

              <Storefront slide={slide} reduce={!!reduce} />
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
      </motion.div>
    </section>
  );
}

function Storefront({ slide, reduce }: { slide: Slide; reduce: boolean }) {
  return (
    <div className="hidden justify-end md:flex" aria-hidden>
      <div className="relative">
        <motion.div
          className="absolute -top-3 left-4 right-4 z-10 flex h-3.5 overflow-hidden rounded-t-lg"
          initial={reduce ? false : { y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className={`h-full flex-1 ${i % 2 === 0 ? "bg-white/90" : "bg-primary"}`}
            />
          ))}
        </motion.div>

        <motion.div
          className="relative flex h-52 w-52 items-center justify-center rounded-[2rem] bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
          initial={reduce ? false : { scale: 0.82, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.08 }}
        >
          <motion.div
            className="absolute left-4 top-8 h-12 w-10 rounded-lg bg-white/15 ring-1 ring-white/20"
            animate={
              reduce
                ? undefined
                : { y: [0, -8, 0], transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }
            }
          />
          <motion.div
            className="absolute right-5 top-12 h-9 w-14 rounded-lg bg-white/12 ring-1 ring-white/15"
            animate={
              reduce
                ? undefined
                : {
                    y: [0, 7, 0],
                    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                  }
            }
          />

          <motion.div
            className="relative z-[1] flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"
            animate={
              reduce
                ? undefined
                : { y: [0, -6, 0], transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } }
            }
          >
            <Icon icon={slide.statIcon} className="h-10 w-10 text-white" />
          </motion.div>

          <motion.div
            className="absolute -right-2 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-ink shadow-card"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.45 }}
          >
            <Icon icon={Sparkles} className="h-4 w-4" />
          </motion.div>

          <motion.div
            className="absolute -left-3 top-20 flex h-8 items-center gap-1.5 rounded-full bg-white px-2.5 text-[10px] font-semibold text-ink shadow-card"
            initial={reduce ? false : { x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Icon icon={Truck} className="h-3.5 w-3.5 text-primary" />
            COD
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute -left-4 bottom-6 z-20 min-w-[11.5rem] rounded-2xl bg-white px-4 py-3 text-ink shadow-card"
          initial={reduce ? false : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold">{slide.statTitle}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{slide.statText}</p>
        </motion.div>
      </div>
    </div>
  );
}
