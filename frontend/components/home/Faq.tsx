"use client";

import { Accordion } from "@/components/ui/Accordion";
import { useI18n, type Key } from "@/lib/i18n";

const FAQ_ITEMS: { id: string; q: Key; a: Key }[] = [
  { id: "buy", q: "faqQ1", a: "faqA1" },
  { id: "sell", q: "faqQ2", a: "faqA2" },
  { id: "cod", q: "faqQ3", a: "faqA3" },
  { id: "delivery", q: "faqQ4", a: "faqA4" },
  { id: "returns", q: "faqQ5", a: "faqA5" },
];

export function Faq() {
  const { t } = useI18n();

  return (
    <section className="container-n mt-block" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        {t("faqTitle")}
      </h2>
      <Accordion
        items={FAQ_ITEMS.map((item) => ({
          id: item.id,
          title: t(item.q),
          content: t(item.a),
        }))}
      />
    </section>
  );
}
