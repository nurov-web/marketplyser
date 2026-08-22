"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Category, Product } from "@/types";

export default function ProductForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [cats, setCats] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    categoryId: "",
    brand: "",
    stock: "1",
    images: [] as string[],
    specsText: "Хотира: 256GB",
  });

  useEffect(() => {
    api<{ items: Category[] }>("/api/categories").then((d) => {
      setCats(d.items);
      if (d.items[0] && !form.categoryId) setForm((f) => ({ ...f, categoryId: d.items[0].id }));
    });
    if (mode === "edit" && params.id) {
      api<Product>(`/api/products/${params.id}`).then((p) => {
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          discount: String(p.discount),
          categoryId: p.category?.id || "",
          brand: p.brand || "",
          stock: String(p.stock),
          images: p.images.map((i) => i.url),
          specsText: p.specs ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join("\n") : "",
        });
      }).catch(() => {});
    }
  }, [mode, params.id]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const data = await api<{ urls: string[] }>("/api/upload/many", { method: "POST", body: fd });
      setForm((f) => ({ ...f, images: [...f.images, ...(data.urls || [])] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Боргузории расм кор накард");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const specs: Record<string, string> = {};
    form.specsText.split("\n").forEach((line) => {
      const [k, ...rest] = line.split(":");
      if (k && rest.length) specs[k.trim()] = rest.join(":").trim();
    });
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        discount: Number(form.discount),
        categoryId: form.categoryId,
        brand: form.brand,
        stock: Number(form.stock),
        images: form.images.length ? form.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
        specs,
      };
      if (mode === "new") await api("/api/products", { method: "POST", body: JSON.stringify(body) });
      else await api(`/api/products/${params.id}`, { method: "PUT", body: JSON.stringify(body) });
      router.push("/seller/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3">
      <h1 className="text-2xl font-bold">{mode === "new" ? "Маҳсулоти нав" : "Таҳрир"}</h1>
      <input required placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <textarea required placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
      </div>
      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
        {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
      <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
      <textarea placeholder="Specifications (key: value)" rows={3} value={form.specsText} onChange={(e) => setForm({ ...form, specsText: e.target.value })} />
      <input type="file" multiple accept="image/*" onChange={(e) => upload(e.target.files)} />
      <p className="text-xs text-slate-500">{form.images.length} расм</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-gold">Publish Product</button>
    </form>
  );
}
