"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, ShoppingBag, Store, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { toast } from "@/components/ui/Toast";

export function AuthModal() {
  const { mode, next, close, open } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  function onClose() {
    close();
    if (pathname === "/register" || pathname === "/login") router.push("/");
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Пӯшидан" onClick={onClose} />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="relative z-10 w-full overflow-hidden rounded-t-3xl bg-white shadow-lift sm:max-w-[380px] sm:rounded-3xl"
          >
            <div className="h-16 bg-gradient-to-r from-[#0b1f4b] via-primary to-sky-500" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              aria-label="Пӯшидан"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="-mt-6 px-5 pb-5">
              <div className="rounded-2xl bg-white p-5 shadow-card">
                {mode === "register" ? (
                  <RegisterInner
                    onLogin={() => open("login", { next })}
                    onDone={(to) => {
                      close();
                      router.push(to);
                    }}
                  />
                ) : (
                  <LoginInner
                    next={next}
                    onRegister={() => open("register", { next })}
                    onDone={(to) => {
                      close();
                      router.push(to);
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

const field = "rounded-xl !py-2.5";

function RegisterInner({ onLogin, onDone }: { onLogin: () => void; onDone: (to: string) => void }) {
  const { refresh } = useAuth();
  const [intent, setIntent] = useState<"buy" | "sell">("buy");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    shopName: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, intent }),
      });
      await refresh();
      toast("Аккаунт сохта шуд");
      onDone(intent === "sell" ? "/seller" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 id="auth-title" className="text-xl font-bold">
        Сабти ном
      </h2>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setIntent("buy")}
          className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold ${
            intent === "buy" ? "bg-white text-primary shadow-sm" : "text-slate-500"
          }`}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Харид
        </button>
        <button
          type="button"
          onClick={() => setIntent("sell")}
          className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold ${
            intent === "sell" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500"
          }`}
        >
          <Store className="h-4 w-4" aria-hidden />
          Фурӯш
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className={field} placeholder="Ном" required autoComplete="given-name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
        <input className={field} placeholder="Насаб" required autoComplete="family-name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
      </div>
      <input className={field} type="email" placeholder="Email" required autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      <input className={field} placeholder="Телефон" required autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      <div className="relative">
        <input
          className={`${field} pr-11`}
          type={show ? "text" : "password"}
          placeholder="Парол"
          required
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShow((s) => !s)} aria-label="Нишон додани парол">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {intent === "sell" && (
        <input className={field} placeholder="Номи дӯкон (ихтиёрӣ)" value={form.shopName} onChange={(e) => set("shopName", e.target.value)} />
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "Интизор..." : "Сабт шудан"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Аккаунт ҳаст?{" "}
        <button type="button" className="font-semibold text-primary" onClick={onLogin}>
          Ворид
        </button>
      </p>
    </form>
  );
}

function LoginInner({ next, onRegister, onDone }: { next: string; onRegister: () => void; onDone: (to: string) => void }) {
  const { refresh } = useAuth();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password, ...(mode === "email" ? { email } : { phone }) }),
      });
      await refresh();
      setDone(true);
      toast("Хуш омадед!");
      setTimeout(() => onDone(next || "/"), reduce ? 0 : 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="relative space-y-3">
      {done && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <p className="mt-2 font-semibold">Хуш омадед</p>
        </div>
      )}
      <h2 id="auth-title" className="text-xl font-bold">
        Воридшавӣ
      </h2>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        <button type="button" onClick={() => setMode("email")} className={`min-h-10 rounded-lg text-sm font-semibold ${mode === "email" ? "bg-white shadow-sm" : "text-slate-500"}`}>
          Email
        </button>
        <button type="button" onClick={() => setMode("phone")} className={`min-h-10 rounded-lg text-sm font-semibold ${mode === "phone" ? "bg-white shadow-sm" : "text-slate-500"}`}>
          Телефон
        </button>
      </div>
      {mode === "email" ? (
        <input className={field} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" placeholder="email@nurov.tj" required />
      ) : (
        <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+992..." required />
      )}
      <div className="relative">
        <input
          className={`${field} pr-11`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={show ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Парол"
          required
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShow((s) => !s)} aria-label="Нишон додани парол">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Интизор...
          </span>
        ) : (
          "Ворид шудан"
        )}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Аккаунт нест?{" "}
        <button type="button" className="font-semibold text-primary" onClick={onRegister}>
          Сабти ном
        </button>
      </p>
    </form>
  );
}
