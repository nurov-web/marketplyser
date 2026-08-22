"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AuthMode = "login" | "register";

type Ctx = {
  mode: AuthMode | null;
  next: string;
  open: (mode: AuthMode, opts?: { next?: string }) => void;
  close: () => void;
};

const AuthModalCtx = createContext<Ctx>({
  mode: null,
  next: "/",
  open: () => {},
  close: () => {},
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [next, setNext] = useState("/");

  const open = useCallback((m: AuthMode, opts?: { next?: string }) => {
    setNext(opts?.next || "/");
    setMode(m);
  }, []);

  const close = useCallback(() => setMode(null), []);

  const value = useMemo(() => ({ mode, next, open, close }), [mode, next, open, close]);

  return <AuthModalCtx.Provider value={value}>{children}</AuthModalCtx.Provider>;
}

export function useAuthModal() {
  return useContext(AuthModalCtx);
}
