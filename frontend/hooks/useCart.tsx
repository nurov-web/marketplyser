"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  subtotal: number;
  total: number;
  delivery: number;
  loading: boolean;
  count: number;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<boolean>;
};

const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [delivery, setDelivery] = useState(5);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      setTotal(0);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ items: CartItem[]; subtotal: number; total: number; delivery: number }>("/api/cart");
      setItems(data.items);
      setSubtotal(data.subtotal);
      setTotal(data.total);
      setDelivery(data.delivery);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) return false;
      try {
        await api("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) });
        await refresh();
        toast("Ба сабад илова шуд");
        return true;
      } catch (err) {
        toast(err instanceof Error ? err.message : "Сабад кор накард", "err");
        return false;
      }
    },
    [user, refresh]
  );

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const value = useMemo(
    () => ({ items, subtotal, total, delivery, loading, count, refresh, add }),
    [items, subtotal, total, delivery, loading, count, refresh, add]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
