"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import type { Product } from "@/types";

export default function SellerProducts() {
  const [items, setItems] = useState<Product[]>([]);
  function load() {
    api<{ items: Product[] }>("/api/products/seller/mine").then((d) => setItems(d.items)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Маҳсулот</h1>
        <Link href="/seller/products/new" className="btn-gold">Add Product</Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr><th className="p-3">Ном</th><th>Нарх</th><th>Захира</th><th>Статус</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{p.name}</td>
                <td>{money(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.moderationStatus}</td>
                <td className="p-3">
                  <Link href={`/seller/products/${p.id}`} className="text-gold-700">Таҳрир</Link>
                  <button
                    className="ml-3 text-red-600"
                    onClick={async () => {
                      await api(`/api/products/${p.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    Пинҳон
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
