"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api, mediaUrl, money } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/ui";

type Row = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  moderationStatus: string;
  seller: { shopName: string };
  category?: { name: string };
  images?: { url: string }[];
};

const STATUSES = [
  { value: "", label: "Ҳама" },
  { value: "APPROVED", label: "Нашршуда" },
  { value: "PENDING", label: "Интизор" },
  { value: "HIDDEN", label: "Пинҳон" },
  { value: "REJECTED", label: "Радшуда" },
];

export default function AdminProducts() {
  const [items, setItems] = useState<Row[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (q.trim()) qs.set("q", q.trim());
    api<{ items: Row[] }>(`/api/admin/products?${qs.toString()}`)
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function remove(id: string, name: string) {
    if (!confirm(`Мол «${name}»-ро нест кунем?`)) return;
    try {
      await api(`/api/admin/products/${id}`, { method: "POST", body: JSON.stringify({ action: "delete" }) });
      toast("Мол нест шуд");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Молҳо"
        description="Илова, таҳрир ва нест кардани маҳсулот. Танҳо Admin мол идора мекунад."
        actions={
          <Link href="/admin/products/new" className="btn-primary min-h-11">
            <Icon icon={Plus} className="h-5 w-5" aria-hidden />
            Моли нав
          </Link>
        }
      />

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ҷустуҷӯи мол..." className="sm:flex-1" />
        <select className="sm:max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value || "all"} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button type="submit" className="btn-ghost min-h-11">Ҷустуҷӯ</button>
      </form>

      <div className="mt-5 space-y-3">
        {loading && (
          <>
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
          </>
        )}
        {!loading && !items.length && (
          <EmptyState
            title="Ҳанӯз мол нест"
            hint="Аввал категория созед, баъд мол илова кунед."
            action={
              <>
                <Link href="/admin/categories" className="btn-ghost">Категорияҳо</Link>
                <Link href="/admin/products/new" className="btn-primary">Моли нав</Link>
              </>
            }
          />
        )}
        {items.map((p) => (
          <article key={p.id} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-border/60">
              {p.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(p.images[0].url)} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold leading-snug text-ink">{p.name}</p>
                <StatusBadge status={p.moderationStatus} />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {p.category?.name || "Бе категория"} · {money(p.price)} · {p.stock} дона
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${p.id}`} className="btn-ghost min-h-11 flex-1 sm:flex-none">
                <Icon icon={Pencil} className="h-4 w-4" aria-hidden />
                Таҳрир
              </Link>
              <button
                type="button"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl px-4 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200/80 hover:bg-red-50 sm:flex-none"
                onClick={() => remove(p.id, p.name)}
              >
                <Icon icon={Trash2} className="h-4 w-4" aria-hidden />
                Нест
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
