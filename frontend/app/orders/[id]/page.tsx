"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, money } from "@/lib/api";
import type { Order } from "@/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function load() {
    api<Order>(`/api/orders/${id}`).then(setOrder).catch(() => {});
  }
  useEffect(() => { load(); }, [id]);

  async function cancel() {
    await api(`/api/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) });
    load();
  }

  async function review(productId: string) {
    await api("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ productId, orderId: id, rating, comment }),
    });
    setComment("");
    load();
  }

  if (!order) return <div className="container-n py-16">Боргирӣ...</div>;

  const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const idx = order.status === "CANCELLED" ? -1 : steps.indexOf(order.status);

  return (
    <div className="container-n py-8">
      <h1 className="text-2xl font-bold">Order #{order.number}</h1>
      <p className="mt-2 text-sm text-slate-500">{order.status} · {order.city}, {order.address}</p>
      {order.couponCode && <p className="mt-1 text-sm text-primary">Купон {order.couponCode}</p>}
      <ol className="mt-6 grid grid-cols-5 gap-2">
        {steps.map((s, i) => (
          <li key={s} className={`rounded-xl px-2 py-3 text-center text-[11px] font-semibold ${i <= idx ? "bg-primary text-white" : "bg-white text-muted-foreground"}`}>
            {s}
          </li>
        ))}
      </ol>
      {order.status === "CANCELLED" && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Бекор шуд</p>}
      <div className="mt-6 space-y-3">
        {order.items.map((i) => (
          <div key={i.id} className="rounded-2xl bg-white p-4 shadow-soft">
            <p className="font-medium">{i.name}</p>
            <p className="text-sm text-slate-500">{money(i.price)} × {i.quantity} · {i.status}</p>
            {order.status === "DELIVERED" && (
              <div className="mt-3 border-t pt-3">
                <p className="text-sm font-medium">Review</p>
                <select className="mt-2" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                </select>
                <textarea className="mt-2" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Таҷрибаи харид..." />
                <button className="btn-primary mt-2" onClick={() => review(i.productId)}>Add Review</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 font-bold">Total {money(order.total)}</p>
      {!["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status) && (
        <div className="mt-6 max-w-md">
          <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Сабаби бекоркунӣ (ҳатмӣ)" />
          <button className="btn-ghost mt-2" onClick={cancel}>Бекор кардан</button>
        </div>
      )}
    </div>
  );
}
