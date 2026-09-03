"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { api, money } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { SafeImg } from "@/components/ui/SafeImg";

export default function CartPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { items, subtotal, delivery, total, refresh, loading: cartLoading } = useCart();

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/cart");
  }, [user, loading, router]);

  async function qty(id: string, quantity: number) {
    try {
      await api(`/api/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity }) });
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    }
  }

  async function remove(id: string) {
    try {
      await api(`/api/cart/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    }
  }

  return (
    <div className="container-n py-8 pb-28 md:pb-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Сабад</h1>
        <div className={`mt-6 grid items-start gap-6 ${cartLoading || items.length ? "md:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
          <div className="space-y-3">
            {cartLoading && (
              <div className="space-y-3">
                <div className="skeleton h-24" />
                <div className="skeleton h-24" />
              </div>
            )}
            {items.map((i) => (
              <div key={i.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <SafeImg
                    src={i.product.images?.[0]?.url}
                    alt={i.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${i.product.id}`} className="font-medium text-ink hover:text-primary">
                    {i.product.name}
                  </Link>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                    {money(i.unitPrice)} × {i.quantity}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn-ghost min-h-11 min-w-11 px-0"
                        aria-label="Кам кардан"
                        disabled={i.quantity <= 1}
                        onClick={() => qty(i.id, i.quantity - 1)}
                      >
                        <Icon icon={Minus} className="h-4 w-4" aria-hidden />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                        {i.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost min-h-11 min-w-11 px-0"
                        aria-label="Зиёд кардан"
                        onClick={() => qty(i.id, i.quantity + 1)}
                      >
                        <Icon icon={Plus} className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="ml-auto inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-medium text-red-700"
                      onClick={() => remove(i.id)}
                    >
                      <Icon icon={Trash2} className="h-4 w-4" aria-hidden />
                      Хориҷ
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!cartLoading && !items.length && (
              <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-soft">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                  <Icon icon={ShoppingBag} className="h-10 w-10 text-primary" aria-hidden />
                </div>
                <h2 className="mt-5 text-lg font-bold text-ink">Сабад холӣ аст</h2>
                <p className="mt-2 text-sm text-muted-foreground">Маҳсулотро аз каталог илова кунед.</p>
                <Link href="/search" className="btn-primary mt-6">
                  Ба каталог
                </Link>
              </div>
            )}
          </div>
          {(cartLoading || items.length > 0) && (
          <aside className="hidden h-fit rounded-2xl border border-border bg-white p-5 shadow-soft md:sticky md:top-24 md:block">
            <h2 className="text-sm font-semibold text-ink">Ҷамъбаст</h2>
            <p className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Ҷамъи мол</span>
              <span className="tabular-nums">{money(subtotal)}</span>
            </p>
            <p className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Расонидан</span>
              <span className="tabular-nums">{money(delivery)}</span>
            </p>
            <p className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-bold">
              <span>Ҷамъ</span>
              <span className="tabular-nums">{money(total)}</span>
            </p>
            <Link href="/checkout" className="btn-primary mt-5 w-full">
              Ба пардохт
            </Link>
          </aside>
          )}
        </div>
      </div>
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-white/95 px-4 py-2.5 shadow-lift backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Ҷамъ</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{money(total)}</p>
            </div>
            <Link href="/checkout" className="btn-primary min-h-12 flex-1">
              Ба пардохт
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
