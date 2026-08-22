"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Seller, User } from "@/types";

type AuthState = {
  user: User | null;
  seller: Seller | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  user: null,
  seller: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await api<{ user: User | null; seller: Seller | null }>("/api/auth/me");
      setUser(data.user);
      setSeller(data.seller);
    } catch {
      setUser(null);
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    setSeller(null);
  };

  const value = useMemo(() => ({ user, seller, loading, refresh, logout }), [user, seller, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
