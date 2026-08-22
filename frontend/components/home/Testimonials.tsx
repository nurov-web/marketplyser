"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

export function Testimonials() {
  const { t } = useI18n();
  const quotes = [
    { text: t("quote1"), name: t("quote1Name"), role: t("quote1Role") },
    { text: t("quote2"), name: t("quote2Name"), role: t("quote2Role") },
    { text: t("quote3"), name: t("quote3Name"), role: t("quote3Role") },
  ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % quotes.length), 6000);
    return () => window.clearInterval(id);
  }, [paused, reduce, quotes.length]);

  const quote = quotes[index];

  return (
    <section
      className="container-n mt-block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("quotesTitle")}</h2>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost min-h-11 min-w-11 px-3" onClick={() => setIndex((i) => (i - 1 + quotes.length) % quotes.length)} aria-label={t("prev")}>
            <Icon icon={ChevronLeft} className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className="btn-ghost min-h-11 min-w-11 px-3" onClick={() => setPaused((p) => !p)} aria-label={paused || reduce ? t("play") : t("pause")}>
            {paused || reduce ? <Icon icon={Play} className="h-4 w-4" aria-hidden /> : <Icon icon={Pause} className="h-4 w-4" aria-hidden />}
          </button>
          <button type="button" className="btn-ghost min-h-11 min-w-11 px-3" onClick={() => setIndex((i) => (i + 1) % quotes.length)} aria-label={t("next")}>
            <Icon icon={ChevronRight} className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      <blockquote className="mt-6 rounded-2xl bg-white p-8 shadow-soft md:p-12" aria-live="polite">
        <p className="text-lg leading-8 text-ink md:text-2xl">“{quote.text}”</p>
        <footer className="mt-6">
          <p className="font-semibold">{quote.name}</p>
          <p className="text-sm text-muted-foreground">{quote.role}</p>
        </footer>
        <p className="sr-only">
          {index + 1} / {quotes.length}
        </p>
      </blockquote>
    </section>
  );
}
