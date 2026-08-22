"use client";

import { Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

const OPTIONS = [
  { value: "", label: "Ҳама", stars: 0 },
  { value: "5", label: "5", stars: 5 },
  { value: "4", label: "4+", stars: 4 },
  { value: "3", label: "3+", stars: 3 },
];

export function RatingPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div role="radiogroup" aria-label="Рейтинг" className="mt-3 grid grid-cols-4 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            key={opt.value || "all"}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            className="relative min-h-14 overflow-hidden rounded-xl px-1 py-2 text-center"
          >
            {active && (
              <motion.span
                layoutId="filter-rating-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-soft"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative flex flex-col items-center gap-1">
              {opt.stars === 0 ? (
                <span className={`text-[11px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>Ҳама</span>
              ) : (
                <>
                  <span className="flex justify-center">
                    {Array.from({ length: opt.stars }).map((_, s) => (
                      <motion.span
                        key={s}
                        initial={false}
                        animate={{ scale: active ? 1.08 : 1 }}
                        transition={{ delay: s * 0.03, type: "spring", stiffness: 400, damping: 18 }}
                      >
                        <Icon
                          icon={Star}
                          aria-hidden
                          className={`h-3 w-3 ${active ? "fill-amber-400 text-amber-400" : "fill-amber-300 text-amber-300"}`}
                        />
                      </motion.span>
                    ))}
                  </span>
                  <span className={`text-[11px] font-bold ${active ? "text-ink" : "text-muted-foreground"}`}>{opt.label}</span>
                </>
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
