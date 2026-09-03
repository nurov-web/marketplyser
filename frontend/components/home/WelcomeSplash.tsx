"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPinned, ShieldCheck, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

const KEY = "nurov-intro-v2";
const TOTAL_MS = 5000;

export function WelcomeSplash() {
  const pathname = usePathname();
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = useMemo(
    () => [
      {
        icon: ShieldCheck,
        title: t("splash1Title"),
        text: t("splash1Text"),
        photo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      },
      {
        icon: Truck,
        title: t("splash2Title"),
        text: t("splash2Text"),
        photo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
      },
      {
        icon: MapPinned,
        title: t("splash3Title"),
        text: t("splash3Text"),
        photo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    [t]
  );

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      /* ignore */
    }
    setOpen(true);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const step = reduce ? TOTAL_MS : Math.floor(TOTAL_MS / slides.length);
    const tick = window.setInterval(() => {
      setIndex((i) => {
        if (i >= slides.length - 1) {
          finish();
          return i;
        }
        return i + 1;
      });
    }, step);
    const end = window.setTimeout(finish, TOTAL_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduce, slides.length]);

  function finish() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open || pathname !== "/") return null;
  const slide = slides[index] || slides[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1f4b]" role="dialog" aria-modal="true" aria-label={t("splash1Title")}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.title}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.photo} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f4b]/85 via-[#0b1f4b]/72 to-[#071433]/95" />
        </motion.div>
      </AnimatePresence>

      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-lg px-6 text-center text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/12 ring-1 ring-white/25 backdrop-blur-md">
              <Icon icon={slide.icon} className="h-8 w-8" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Nurov</p>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight sm:text-4xl">{slide.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-blue-100/90 sm:text-base">{slide.text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-center gap-2" aria-hidden>
          {slides.map((s, i) => (
            <span
              key={s.title}
              className={`h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-white/30" : "w-2 bg-white/30"
              }`}
            >
              {i === index && (
                <motion.span
                  className="block h-full rounded-full bg-white"
                  initial={reduce ? { width: "100%" } : { width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: reduce ? 0 : TOTAL_MS / slides.length / 1000, ease: "linear" }}
                />
              )}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white/12 px-6 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/20"
          onClick={finish}
        >
          {t("splashSkip")}
        </button>
      </div>
    </div>
  );
}
