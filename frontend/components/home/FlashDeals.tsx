"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { ProductGrid } from "@/components/home/ProductGrid";
import type { Product } from "@/types";

function DealClock() {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const ends = new Date();
      ends.setHours(23, 59, 59, 0);
      const ms = Math.max(0, ends.getTime() - Date.now());
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-white">{left || "--:--:--"}</span>;
}

export function FlashDeals({ products }: { products: Product[] }) {
  if (!products?.length) return null;
  return (
    <div>
      <div className="container-n mt-block mb-[-1.5rem] flex items-center gap-3">
        <Timer className="h-5 w-5 text-accent" />
        <p className="text-sm font-semibold">
          Тахфифи рӯз <DealClock />
        </p>
      </div>
      <ProductGrid title="Flash Deal" products={products} href="/search" />
    </div>
  );
}
