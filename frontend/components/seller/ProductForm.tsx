"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, mediaUrl } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import type { Category, Product } from "@/types";

export default function ProductForm({
  mode,
  redirectTo = "/admin/products",
}: {
  mode: "new" | "edit";
  redirectTo?: string;
}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [cats, setCats] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    categoryId: "",
    brand: "",
    stock: "1",
    images: [] as string[],
    specsText: "",
  });

  useEffect(() => {
    api<{ items: Category[] }>("/api/categories")
      .then((d) => {
        setCats(d.items);
        if (d.items[0] && !form.categoryId) setForm((f) => ({ ...f, categoryId: d.items[0].id }));
      })
      .catch(() => setCats([]));
    if (mode === "edit" && params.id) {
      api<Product>(`/api/products/${params.id}`)
        .then((p) => {
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
        })
        .catch(() => setError("Маҳсулот ёфт нашуд"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (form.name.trim().length < 2) {
      setError("Номи молро нависед");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Тавсиф бояд аз 10 ҳарф зиёд бошад");
      return;
    }
    if (!form.categoryId) {
      setError("Категорияро интихоб кунед");
      return;
    }
    if (!Number(form.price) || Number(form.price) <= 0) {
      setError("Нархи дуруст нависед");
      return;
    }
    if (!form.images.length) {
      setError("Камтар як расм илова кунед");
      return;
    }
    const specs: Record<string, string> = {};
    form.specsText.split("\n").forEach((line) => {
      const [k, ...rest] = line.split(":");
      if (k && rest.length) specs[k.trim()] = rest.join(":").trim();
    });
    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discount: Number(form.discount) || 0,
        categoryId: form.categoryId,
        brand: form.brand.trim() || undefined,
        stock: Number(form.stock) || 0,
        images: form.images,
        specs,
      };
      if (mode === "new") await api("/api/products", { method: "POST", body: JSON.stringify(body) });
      else await api(`/api/products/${params.id}`, { method: "PUT", body: JSON.stringify(body) });
      toast(mode === "new" ? "Мол илова шуд" : "Мол навсозӣ шуд");
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{mode === "new" ? "Моли нав" : "Таҳрири мол"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Танҳо Admin молро дар сайт ҷойгир мекунад.</p>
      </div>

      {!cats.length && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          Аввал категория созед.
          <Link href="/admin/categories" className="ml-2 font-semibold text-primary">
            Ба категорияҳо
          </Link>
        </div>
      )}

      <label className="block text-sm font-semibold">
        Номи мол
        <input
          required
          minLength={2}
          className="mt-1.5"
          placeholder="Масалан: iPhone 15"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label className="block text-sm font-semibold">
        Тавсиф
        <textarea
          required
          minLength={10}
          className="mt-1.5"
          placeholder="Дар бораи мол нависед (камтар 10 ҳарф)"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold">
          Нарх (TJS)
          <input
            required
            type="number"
            min={1}
            step="0.01"
            className="mt-1.5"
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </label>
        <label className="block text-sm font-semibold">
          Тахфиф %
          <input
            type="number"
            min={0}
            max={90}
            className="mt-1.5"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Категория
        <select
          className="mt-1.5"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold">
          Бренд
          <input className="mt-1.5" placeholder="ихтиёрӣ" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold">
          Шумора дар анбор
          <input
            type="number"
            min={0}
            className="mt-1.5"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Хусусиятҳо (ихтиёрӣ)
        <textarea
          className="mt-1.5"
          placeholder={"Ҳар сатр: калид: қимат\nМасалан: Ранг: Сиёҳ"}
          rows={3}
          value={form.specsText}
          onChange={(e) => setForm({ ...form, specsText: e.target.value })}
        />
      </label>
      <label className="block text-sm font-semibold">
        Расмҳо
        <input className="mt-1.5" type="file" multiple accept="image/*" onChange={(e) => upload(e.target.files)} />
      </label>
      {form.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.images.map((url) => (
            <button
              key={url}
              type="button"
              className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-border"
              onClick={() => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }))}
              title="Нест кардани расм"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(url)} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{form.images.length} расм · барои нест кардан расмро пахш кунед</p>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="btn-primary min-h-12 flex-1" disabled={busy || !cats.length}>
          {busy ? "Интизор..." : mode === "new" ? "Илова кардан" : "Нигоҳ доштан"}
        </button>
        <Link href={redirectTo} className="btn-ghost min-h-12">
          Бекор
        </Link>
      </div>
    </form>
  );
}
