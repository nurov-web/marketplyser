"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { AdminCard, AdminPageHeader, EmptyState } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";

type Row = {
  id: string;
  rating: number;
  comment: string;
  user: { firstName: string; lastName: string };
  product: { name: string };
};

export default function AdminReviews() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<{ items: Row[] }>("/api/admin/reviews")
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader title="Баррасиҳо" description="Баррасиҳои харидорон дар маҳсулот." />

      {loading && <div className="mt-6 skeleton h-24 rounded-2xl" />}
      {!loading && !items.length && (
        <EmptyState className="mt-6" title="Баррасӣ нест" hint="Вақте харидорон баррасӣ навишанд, ин ҷо намоиш дода мешавад." />
      )}

      <div className="mt-6 space-y-3">
        {items.map((r) => (
          <AdminCard key={r.id}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-ink">{r.product.name}</span>
              <span className="flex items-center gap-0.5 text-amber-600">
                <Icon icon={Star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                {r.rating}
              </span>
              <span className="text-muted-foreground">· {r.user.firstName}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{r.comment}</p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-red-700 hover:underline"
              onClick={async () => {
                await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
                load();
              }}
            >
              Хориҷ кардан
            </button>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
