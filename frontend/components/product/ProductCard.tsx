"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { api, mediaUrl, money } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCart } from "@/hooks/useCart";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const img = product.images?.[0]?.url;
  const { user } = useAuth();
  const { open } = useAuthModal();
  const { add } = useCart();
  const { t } = useI18n();

  async function onFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return open("login");
    try {
      const data = await api<{ favorited: boolean }>("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
      });
      toast(data.favorited ? "Ба дӯстдоштаҳо илова шуд" : "Аз дӯстдоштаҳо хориҷ шуд");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    }
  }

  async function onCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return open("login");
    await add(product.id);
  }

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/80 [content-visibility:auto] [contain-intrinsic-size:360px]">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(img, "sm")}
                alt={product.name}
                width={320}
                height={320}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "low"}
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            )}
            {product.discount > 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-ink shadow-sm md:left-3 md:top-3">
                -{product.discount}%
              </span>
            )}
          </div>
          <div className="p-3 pb-2 md:p-3.5">
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-ink">{product.name}</p>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon={Star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="tabular-nums">{product.rating || "—"}</span>
              <span>·</span>
              <span className="tabular-nums">{product.reviewCount || 0}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-bold tabular-nums text-ink md:text-lg">{money(product.finalPrice ?? product.price)}</span>
              {product.discount > 0 && (
                <span className="text-xs text-muted-foreground line-through tabular-nums">{money(product.price)}</span>
              )}
            </div>
          </div>
        </Link>
        <button
          type="button"
          className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white text-rose-500 shadow-lg transition hover:border-rose-200 hover:bg-rose-50 hover:shadow-md active:scale-95 md:right-3 md:top-3 md:h-11 md:w-11"
          onClick={onFav}
          aria-label={t("favorites")}
        >
          <Heart
            className="h-5 w-5 shrink-0 stroke-rose-500 md:h-[22px] md:w-[22px]"
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
      </div>
      <div className="px-3 pb-3 md:px-3.5 md:pb-3.5">
        <button
          type="button"
          className="btn-primary min-h-11 w-full gap-2 text-xs md:text-sm"
          onClick={onCart}
          aria-label={t("addToCart")}
        >
          <Icon icon={ShoppingBag} className="h-4 w-4 shrink-0" aria-hidden />
          <span>{t("addToCart")}</span>
        </button>
      </div>
    </article>
  );
}
