"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Flag,
  GitCompare,
  Heart,
  ImageOff,
  Loader2,
  MessageCircle,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import { api, mediaUrl, money } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/components/ui/Toast";
import { rememberProduct } from "@/lib/recent";
import { toggleCompare, inCompare } from "@/lib/compare";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/types";

const TABS = [
  { id: "desc", label: "Тавсиф" },
  { id: "specs", label: "Хусусиятҳо" },
  { id: "reviews", label: "Баррасиҳо" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          icon={Star}
          className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { open } = useAuthModal();
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [active, setActive] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [favOn, setFavOn] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [compared, setCompared] = useState(false);
  const [report, setReport] = useState("");
  const [tab, setTab] = useState<TabId>("desc");

  useEffect(() => {
    api<Product>(`/api/products/${id}`)
      .then((prod) => {
        setP(prod);
        rememberProduct(prod.id);
        setCompared(inCompare(prod.id));
      })
      .catch(() => setError("Маҳсулот ёфт нашуд"));
    api<{ items: Product[] }>(`/api/products/${id}/related`)
      .then((d) => setRelated(d.items))
      .catch(() => {});
  }, [id]);

  if (error) {
    return (
      <div className="container-n py-20 text-center">
        <p className="text-lg font-semibold text-ink">{error}</p>
        <Link href="/search" className="btn-primary mt-6">
          Ба каталог
        </Link>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container-n grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="skeleton aspect-square" />
        <div className="space-y-3">
          <div className="skeleton h-5 w-1/3" />
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-6 w-1/4" />
          <div className="skeleton h-24" />
          <div className="skeleton h-11 w-full" />
        </div>
      </div>
    );
  }

  const images = p.images?.length ? p.images : [];
  const specs = p.specs || {};
  const specEntries = Object.entries(specs);
  const outOfStock = p.stock <= 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  function needAuth() {
    open("login", { next: `/product/${p!.id}` });
    return false;
  }

  async function addCart(buyNow = false) {
    if (!user) return needAuth();
    setBusy(buyNow ? "buy" : "cart");
    const ok = await add(p!.id);
    setBusy("");
    if (ok) router.push(buyNow ? "/checkout" : "/cart");
  }

  async function fav() {
    if (!user) return needAuth();
    try {
      const data = await api<{ favorited: boolean }>("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ productId: p!.id }),
      });
      setFavOn(data.favorited);
      toast(data.favorited ? "Ба дӯстдоштаҳо илова шуд" : "Хориҷ шуд");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    }
  }

  async function chat() {
    if (!user) return needAuth();
    setBusy("chat");
    try {
      const data = await api<{ conversationId: string }>("/api/messages", {
        method: "POST",
        body: JSON.stringify({ sellerId: p!.seller?.id, productId: p!.id, content: msg || "Салом, маҳсулот ҳаст?" }),
      });
      router.push(`/chat?c=${data.conversationId}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Чат кор накард", "err");
      setBusy("");
    }
  }

  function shiftImage(dir: number) {
    if (images.length < 2) return;
    setActive((i) => (i + dir + images.length) % images.length);
  }

  return (
    <div className="container-n py-8 pb-28 md:pb-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="relative aspect-square bg-slate-100">
              {images[active] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(images[active].url, "lg")}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-200"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Icon icon={ImageOff} className="h-12 w-12" aria-hidden />
                  <span className="text-sm">Расм нест</span>
                </div>
              )}
              {p.discount > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-ink">
                  −{p.discount}%
                </span>
              )}
              {outOfStock && (
                <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white">
                  Тамом шуд
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-soft"
                    aria-label="Расми қаблӣ"
                    onClick={() => shiftImage(-1)}
                  >
                    <Icon icon={ChevronLeft} className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-soft"
                    aria-label="Расми навбатӣ"
                    onClick={() => shiftImage(1)}
                  >
                    <Icon icon={ChevronRight} className="h-5 w-5" aria-hidden />
                  </button>
                </>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Расми ${i + 1} аз ${images.length}`}
                  aria-current={i === active ? "true" : undefined}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 motion-safe:transition-opacity motion-safe:duration-200 ${
                    i === active ? "ring-2 ring-primary ring-offset-2" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit space-y-5 rounded-2xl border border-border bg-white p-5 shadow-soft md:p-6 lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">
            {p.category?.name}
            {p.brand ? ` · ${p.brand}` : ""}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">{p.name}</h1>
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 text-sm text-ink"
            onClick={() => setTab("reviews")}
            aria-label={`${p.rating} аз 5, ${p.reviewCount} баррасӣ`}
          >
            <Stars value={Number(p.rating) || 0} />
            <span className="font-medium tabular-nums">{p.rating || "—"}</span>
            <span className="text-muted-foreground">· {p.reviewCount || 0} баррасӣ</span>
          </button>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums text-ink">{money(p.finalPrice)}</span>
            {p.discount > 0 && (
              <span className="text-base text-muted-foreground line-through tabular-nums">{money(p.price)}</span>
            )}
            {p.discount > 0 && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-ink">Тахфиф {p.discount}%</span>
            )}
          </div>
          <p className={`text-sm font-medium ${outOfStock ? "text-red-700" : lowStock ? "text-amber-800" : "text-ink"}`}>
            {outOfStock ? "Дар анбор нест" : lowStock ? `Кам монда: ${p.stock} дона` : `Дар анбор: ${p.stock} дона`}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <Icon icon={Store} className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">Фурӯшанда:</span>
            {p.seller?.id ? (
              <Link href={`/shop/${p.seller.id}`} className="font-semibold text-primary">
                {p.seller.shopName}
              </Link>
            ) : (
              <b>{p.seller?.shopName}</b>
            )}
            {p.seller?.status === "APPROVED" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                <Icon icon={BadgeCheck} className="h-3.5 w-3.5" aria-hidden />
                Тасдиқшуда
              </span>
            )}
          </p>

          <div className="space-y-2">
            <button
              type="button"
              className="btn-primary w-full"
              disabled={!!busy || outOfStock}
              onClick={() => addCart(false)}
            >
              {busy === "cart" ? <Icon icon={Loader2} className="h-4 w-4 animate-spin" aria-hidden /> : <Icon icon={ShoppingBag} className="h-4 w-4" aria-hidden />}
              {busy === "cart" ? "Илова..." : "Ба сабад"}
            </button>
            <button
              type="button"
              className="btn-accent w-full"
              disabled={!!busy || outOfStock}
              onClick={() => addCart(true)}
            >
              {busy === "buy" ? "..." : "Ҳозир харидан"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn-ghost flex-1 ${favOn ? "text-accent" : ""}`}
              onClick={fav}
              aria-pressed={favOn}
            >
              <Icon icon={Heart} className={`h-4 w-4 ${favOn ? "fill-accent" : ""}`} aria-hidden />
              Дӯстдошта
            </button>
            <button
              type="button"
              className="btn-ghost flex-1"
              aria-pressed={compared}
              onClick={() => {
                const next = toggleCompare(p.id);
                setCompared(next.includes(p.id));
                toast(next.includes(p.id) ? "Ба муқоиса илова шуд" : "Аз муқоиса хориҷ");
              }}
            >
              <Icon icon={GitCompare} className="h-4 w-4" aria-hidden />
              {compared ? "Дар муқоиса" : "Муқоиса"}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Icon icon={MessageCircle} className="h-4 w-4 text-primary" aria-hidden />
              Пурсиш ба фурӯшанда
            </h2>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Паём</span>
              <textarea
                rows={2}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Савол нависед..."
              />
            </label>
            <button type="button" className="btn-ghost mt-2 w-full sm:w-auto" disabled={busy === "chat"} onClick={chat}>
              {busy === "chat" ? "Фиристода мешавад..." : "Фиристодан"}
            </button>
          </div>
        </aside>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-white shadow-soft">
        <div
          role="tablist"
          aria-label="Маълумоти маҳсулот"
          className="flex gap-1 overflow-x-auto border-b border-border px-2"
          onKeyDown={(e) => {
            const i = TABS.findIndex((t) => t.id === tab);
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              const next = e.key === "ArrowRight" ? (i + 1) % TABS.length : (i - 1 + TABS.length) % TABS.length;
              setTab(TABS[next].id);
              document.getElementById(`tab-${TABS[next].id}`)?.focus();
            }
          }}
        >
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(item.id)}
                className={`relative min-h-11 shrink-0 px-4 text-sm font-semibold motion-safe:transition-opacity motion-safe:duration-200 ${
                  selected ? "text-primary" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {item.label}
                {item.id === "reviews" && p.reviewCount > 0 && (
                  <span className="ml-1 tabular-nums">({p.reviewCount})</span>
                )}
                {selected && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5 md:p-6">
          {tab === "desc" && (
            <div role="tabpanel" id="panel-desc" aria-labelledby="tab-desc" className="space-y-6">
              <p className="max-w-3xl text-sm leading-7 text-ink">{p.description || "Тавсиф ҳанӯз илова нашудааст."}</p>
              <form
                className="max-w-lg rounded-2xl border border-border bg-slate-50 p-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) return open("login", { next: `/product/${p.id}` });
                  if (!report.trim()) return;
                  try {
                    await api("/api/reports", {
                      method: "POST",
                      body: JSON.stringify({ targetType: "PRODUCT", targetId: p.id, reason: report }),
                    });
                    setReport("");
                    toast("Шикоят фиристода шуд");
                  } catch (err) {
                    toast(err instanceof Error ? err.message : "Хато", "err");
                  }
                }}
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon icon={Flag} className="h-4 w-4 text-muted-foreground" aria-hidden />
                  Шикоят аз маҳсулот
                </p>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Сабаб</span>
                  <textarea rows={2} value={report} onChange={(e) => setReport(e.target.value)} placeholder="Сабабро нависед..." />
                </label>
                <button type="submit" className="btn-ghost mt-2">
                  Фиристодан
                </button>
              </form>
            </div>
          )}

          {tab === "specs" && (
            <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs">
              {specEntries.length > 0 ? (
                <dl className="max-w-2xl divide-y divide-border">
                  {specEntries.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4 py-3 text-sm">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Хусусиятҳо зикр нашудаанд.</p>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews">
              {p.reviews?.length ? (
                <div className="space-y-3">
                  {p.reviews.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {r.user.firstName} {r.user.lastName}
                        </p>
                        <span className="sr-only">{r.rating} аз 5</span>
                        <Stars value={r.rating} />
                      </div>
                      {r.comment && <p className="mt-2 text-sm leading-6 text-ink">{r.comment}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ҳанӯз баррасӣ нест.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Маҳсулоти монанд</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-white/95 px-4 py-2.5 shadow-lift backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold tabular-nums leading-tight">{money(p.finalPrice)}</p>
            {p.discount > 0 && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">{money(p.price)}</p>
            )}
          </div>
          <button
            type="button"
            className="btn-primary min-h-12 flex-1"
            disabled={!!busy || outOfStock}
            onClick={() => addCart(false)}
          >
            {busy === "cart" ? <Icon icon={Loader2} className="h-4 w-4 animate-spin" aria-hidden /> : <Icon icon={ShoppingBag} className="h-4 w-4" aria-hidden />}
            {busy === "cart" ? "Илова..." : "Ба сабад"}
          </button>
        </div>
      </div>
    </div>
  );
}
