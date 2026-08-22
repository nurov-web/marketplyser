"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import type { Order } from "@/types";

export default function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  useEffect(() => {
    api<{ items: Order[] }>("/api/admin/orders").then((d) => setItems(d.items)).catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr><th className="p-3">#</th><th>User</th><th>Status</th><th>Total</th></tr></thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="p-3">{o.number}</td>
                <td>{o.fullName}</td>
                <td>{o.status}</td>
                <td>{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
