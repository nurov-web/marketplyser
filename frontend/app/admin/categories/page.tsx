"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
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
      setError("Номи категорияро нависед");
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
      <h1 className="text-2xl font-bold">Категорияҳо</h1>
      <p className="mt-1 text-sm text-muted-foreground">Танҳо Admin категория илова ва нест мекунад.</p>

      <form className="mt-5 max-w-xl space-y-3 rounded-2xl bg-white p-4 shadow-soft sm:p-5" onSubmit={create}>
        <label className="block text-sm font-semibold">
          Номи категория
          <input className="mt-1.5" placeholder="Масалан: Телефонҳо" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          Тавсиф (ихтиёрӣ)
          <input className="mt-1.5" placeholder="Кӯтоҳ нависед" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button className="btn-primary min-h-12 w-full sm:w-auto" disabled={busy}>
          {busy ? "Интизор..." : "Илова кардан"}
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {!items.length && <li className="rounded-xl bg-white p-6 text-center text-sm text-muted-foreground shadow-soft">Ҳанӯз категория нест</li>}
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
            </div>
            <button type="button" className="min-h-11 text-sm font-semibold text-red-700" onClick={() => remove(c)}>
              Нест кардан
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
