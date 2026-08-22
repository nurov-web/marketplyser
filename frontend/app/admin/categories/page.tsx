"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function load() {
    api<{ items: Category[] }>("/api/admin/categories").then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <form
        className="mt-4 flex max-w-xl flex-col gap-2 md:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/api/admin/categories", { method: "POST", body: JSON.stringify({ name, description }) });
          setName("");
          load();
        }}
      >
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn-primary">Сохтан</button>
      </form>
      <ul className="mt-6 space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-soft">
            <span>{c.name}</span>
            <button
              className="text-sm text-red-600"
              onClick={async () => {
                await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
                load();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
