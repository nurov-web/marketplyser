"use client";

import { useI18n, type Lang } from "@/lib/i18n";

const langs: { id: Lang; label: string }[] = [
  { id: "tg", label: "TJ" },
  { id: "ru", label: "РУ" },
  { id: "en", label: "EN" },
];

export function LangSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <div
      className="flex items-center rounded-full bg-slate-100/90 p-1 ring-1 ring-inset ring-slate-200/80"
      role="group"
      aria-label="Language"
    >
      {langs.map((l) => {
        const active = lang === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => setLang(l.id)}
            aria-pressed={active}
            className={`relative flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-[11px] font-bold tracking-wide ${
              active ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-ink"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
