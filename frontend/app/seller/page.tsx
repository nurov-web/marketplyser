"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Dash = {
  totalSales: number;
  orders: number;
  products: number;
  customers: number;
  chart: { date: string; sales: number; orders: number }[];
};

export default function SellerHome() {
  const [d, setD] = useState<Dash | null>(null);
  useEffect(() => {
    api<Dash>("/api/sellers/dashboard").then(setD).catch(() => {});
  }, []);
  if (!d) return <p>Боргирӣ...</p>;
  const cards = [
    { label: "Total Sales", value: money(d.totalSales) },
    { label: "Orders", value: d.orders },
    { label: "Products", value: d.products },
    { label: "Customers", value: d.customers },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="mt-2 text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 h-72 rounded-2xl bg-white p-4 shadow-soft">
        <p className="mb-2 text-sm font-medium">Sales / Orders</p>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={d.chart}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip />
            <Area dataKey="sales" stroke="#CA8A04" fill="#FEF9C3" />
            <Area dataKey="orders" stroke="#0F172A" fill="#E2E8F0" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
