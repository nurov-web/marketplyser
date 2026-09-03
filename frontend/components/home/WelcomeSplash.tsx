"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPinned, ShieldCheck, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

const KEY = "nurov-intro-v1";
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
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.45 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.photo} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#0b1f4b]/70" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 mx-auto max-w-lg px-6 text-center text-white">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <Icon icon={slide.icon} className="h-7 w-7" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Nurov</p>
        <h2 className="mt-2 text-3xl font-bold">{slide.title}</h2>
        <p className="mt-3 text-sm leading-6 text-blue-100">{slide.text}</p>
        <div className="mt-6 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <span key={s.title} className={`h-1.5 rounded-full ${i === index ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
        <button type="button" className="btn-primary mt-8 min-h-11" onClick={finish}>
          {t("splashSkip")}
        </button>
      </div>
    </div>
  );
}
