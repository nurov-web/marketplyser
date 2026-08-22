"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const uid = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function moveFocus(from: number, key: string) {
    const last = items.length - 1;
    let next = from;
    if (key === "ArrowDown") next = from === last ? 0 : from + 1;
    else if (key === "ArrowUp") next = from === 0 ? last : from - 1;
    else if (key === "Home") next = 0;
    else if (key === "End") next = last;
    else return false;
    buttons.current[next]?.focus();
    return true;
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      {items.map((item, i) => {
        const open = openId === item.id;
        const headerId = `${uid}-h-${item.id}`;
        const panelId = `${uid}-p-${item.id}`;
        return (
          <div key={item.id} className={i ? "border-t border-border" : undefined}>
            <h3 className="m-0">
              <button
                type="button"
                id={headerId}
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                onKeyDown={(e) => {
                  if (moveFocus(i, e.key)) e.preventDefault();
                }}
                className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink"
              >
                {item.title}
                <Icon
                  icon={ChevronDown}
                  aria-hidden
                  className={`h-5 w-5 shrink-0 text-primary motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              aria-hidden={!open}
              className={`grid overflow-hidden motion-reduce:transition-none motion-safe:transition-[grid-template-rows] motion-safe:duration-200 ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                <div className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
