"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { AdminCard, AdminPageHeader, EmptyState } from "@/components/admin/ui";
import type { Category } from "@/types";

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api<{ items: Category[] }>("/api/admin/categories")
      .then((d) => setItems(d.items))
      .catch(() => setItems([]));
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Номи категорияро нависед (ҳадди ақал 2 ҳарф)");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      setName("");
      setDescription("");
      toast("Категория илова шуд");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Category) {
    if (!confirm(`Категорияи «${c.name}»-ро нест кунем?`)) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      toast("Категория нест шуд");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Хато", "err");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Категорияҳо"
        description="Категорияҳо дар каталог ва ҷустуҷӯ намоиш дода мешаванд. Пеш аз мол, категория созед."
      />

      <AdminCard className="mt-6 max-w-xl">
        <h2 className="text-sm font-bold text-ink">Категорияи нав</h2>
        <form className="mt-4 space-y-3" onSubmit={create}>
          <label className="block text-sm font-semibold text-ink">
            Ном
            <input className="mt-1.5" placeholder="Масалан: Телефонҳо" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Тавсиф (ихтиёрӣ)
            <input className="mt-1.5" placeholder="Кӯтоҳ тавсиф" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}
          <button type="submit" className="btn-primary min-h-11 w-full sm:w-auto" disabled={busy}>
            {busy ? "Интизор..." : "Илова кардан"}
          </button>
        </form>
      </AdminCard>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {!items.length && (
          <EmptyState title="Ҳанӯз категория нест" hint="Формаи болоро истифода баред." />
        )}
        {items.map((c) => (
          <AdminCard key={c.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">{c.name}</p>
              {c.description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{c.description}</p>}
            </div>
            <button
              type="button"
              className="min-h-10 shrink-0 text-sm font-semibold text-red-700 hover:underline"
              onClick={() => remove(c)}
            >
              Нест кардан
            </button>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
