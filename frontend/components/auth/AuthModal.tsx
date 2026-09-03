"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, Mail, X } from "lucide-react";
import { api } from "@/lib/api";
import { authErrorMessage } from "@/lib/authErrors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { toast } from "@/components/ui/Toast";

const RESEND_COOLDOWN_SEC = 60;
/** Мутобиқи Supabase → Email → Email OTP length */
const OTP_LENGTH = 6;

async function startGoogleOAuth(nextPath = "/") {
  try {
    sessionStorage.setItem("auth_next", nextPath || "/");
  } catch {
    /* ignore */
  }
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Линки Google гирифта нашуд.");
  // Фавран ба Google → баъд худкор ба /auth/callback → воридшавӣ
  window.location.assign(data.url);
}

function GoogleButton({
  busy,
  onClick,
  label = "Бо Google ворид шавед",
}: {
  busy: boolean;
  onClick: () => void;
  label?: string;
}) {
  if (!isSupabaseConfigured()) return null;

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="group relative flex min-h-[3.25rem] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] p-[2px] shadow-md transition hover:shadow-lg disabled:opacity-60"
      >
        <span className="flex h-full min-h-[3rem] w-full items-center justify-center gap-3 rounded-[0.9rem] bg-white px-4 transition group-hover:bg-slate-50">
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
            </svg>
          )}
          <span className="text-[15px] font-bold tracking-tight text-slate-900">{busy ? "Интизор..." : label}</span>
        </span>
      </button>
    </div>
  );
}

function AuthDivider() {
  if (!isSupabaseConfigured()) return null;

  return (
    <div className="flex items-center gap-3 py-1" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">ё</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
    </div>
  );
}

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
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full overflow-hidden rounded-t-2xl bg-white shadow-lift sm:max-w-[400px] sm:rounded-2xl"
          >
            <div className="h-14 bg-[#0b1f4b]" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Пӯшидан"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="-mt-5 px-5 pb-5">
              <div className="rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
                {mode === "register" ? (
                  <RegisterInner
                    next={next}
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

async function finishLocalRegister(
  form: { firstName: string; lastName: string; email: string; phone: string; password: string },
  supabaseAccessToken: string
) {
  await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...form, intent: "buy", supabaseAccessToken }),
  });
  try {
    await getSupabase().auth.signOut({ scope: "local" });
  } catch {
    /* ignore */
  }
}

function RegisterInner({ next, onLogin, onDone }: { next: string; onLogin: () => void; onDone: (to: string) => void }) {
  const { refresh } = useAuth();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendIn, setResendIn] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const otp = digits.join("");

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  function clearOtp() {
    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
  }

  function focusOtp(i: number) {
    otpRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus();
  }

  function writeDigits(next: string[], focusAt?: number) {
    setDigits(next);
    if (typeof focusAt === "number") {
      requestAnimationFrame(() => focusOtp(focusAt));
    }
  }

  function onOtpChange(index: number, raw: string) {
    const only = raw.replace(/\D/g, "");
    if (!only) {
      writeDigits(
        digits.map((d, i) => (i === index ? "" : d)),
        index
      );
      return;
    }
    // Paste ё чанд рақам дар як майдон
    if (only.length > 1) {
      const chars = only.slice(0, OTP_LENGTH).split("");
      const next = Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] || "");
      writeDigits(next, Math.min(chars.length, OTP_LENGTH - 1));
      return;
    }
    const next = digits.map((d, i) => (i === index ? only : d));
    writeDigits(next, index < OTP_LENGTH - 1 ? index + 1 : index);
  }

  function onOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      const next = digits.map((d, i) => (i === index - 1 ? "" : d));
      writeDigits(next, index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusOtp(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusOtp(index + 1);
    }
  }

  function onOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const chars = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    if (!chars.length) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] || "");
    writeDigits(next, Math.min(chars.length, OTP_LENGTH - 1));
  }

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function completeWithToken(accessToken: string) {
    await finishLocalRegister(form, accessToken);
    await refresh();
    toast("Аккаунт сохта шуд");
    onDone("/");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const email = form.email.trim().toLowerCase();

      // Бе калидҳои Supabase — сабти оддӣ (мисли пеш)
      if (!isSupabaseConfigured()) {
        await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ ...form, email, intent: "buy" }),
        });
        await refresh();
        toast("Аккаунт сохта шуд");
        onDone("/");
        return;
      }

      const supabase = getSupabase();
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
          },
        },
      });
      if (signErr) {
        const msg = `${signErr.code || ""} ${signErr.message || ""}`.toLowerCase();
        if (/already.?registered|already.?exists|user.?already|email.?exists/.test(msg)) {
          setForm((f) => ({ ...f, email }));
          clearOtp();
          setStep("verify");
          setResendIn(0);
          setBusy(false);
          return;
        }
        throw signErr;
      }

      // Агар дар Supabase Confirm email хомӯш бошад — сессия фавран меояд.
      if (data.session?.access_token && (data.user?.email_confirmed_at || data.user?.confirmed_at)) {
        await completeWithToken(data.session.access_token);
        return;
      }

      setForm((f) => ({ ...f, email }));
      clearOtp();
      setStep("verify");
      setResendIn(RESEND_COOLDOWN_SEC);
      setBusy(false);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = otp.trim();
    if (token.length !== OTP_LENGTH) {
      setError(`Рамзи ${OTP_LENGTH}-рақамаро аз нома ворид кунед.`);
      return;
    }
    setBusy(true);
    try {
      const { data, error: verifyErr } = await getSupabase().auth.verifyOtp({
        email: form.email,
        token,
        type: "signup",
      });
      if (verifyErr) throw verifyErr;
      const access = data.session?.access_token;
      if (!access) throw new Error("Тасдиқ нашуд. Боз кӯшиш кунед.");
      await completeWithToken(access);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  async function resendCode() {
    if (resendIn > 0 || busy) return;
    setError("");
    setBusy(true);
    try {
      const { error: resendErr } = await getSupabase().auth.resend({
        type: "signup",
        email: form.email,
      });
      if (resendErr) throw resendErr;
      setResendIn(RESEND_COOLDOWN_SEC);
      toast("Рамзи нав фиристода шуд");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setError("");
    setBusy(true);
    try {
      await startGoogleOAuth(next || "/");
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  if (step === "verify") {
    return (
      <form onSubmit={verify} className="space-y-3">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-6 w-6" aria-hidden />
          </span>
        </div>
        <h2 id="auth-title" className="text-center text-xl font-bold">
          Почтаро санҷед
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          Рамзи {OTP_LENGTH}-рақамаро ба <span className="font-medium text-foreground">{form.email}</span> фиристодем.
        </p>
        <div className="flex justify-center gap-2" role="group" aria-label="Рамз аз нома">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                otpRefs.current[i] = el;
              }}
              className="h-12 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold tabular-nums shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 sm:h-12 sm:w-12"
              value={d}
              onChange={(e) => onOtpChange(i, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(i, e)}
              onPaste={onOtpPaste}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={i === 0}
              maxLength={1}
              aria-label={`Рақами ${i + 1}`}
              disabled={busy}
            />
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button className="btn-primary min-h-12 w-full" disabled={busy || otp.length !== OTP_LENGTH}>
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Интизор...
            </span>
          ) : (
            "Тасдиқ"
          )}
        </button>
        <button
          type="button"
          className="min-h-11 w-full rounded-xl text-sm font-semibold text-primary disabled:text-muted-foreground"
          disabled={busy || resendIn > 0}
          onClick={resendCode}
        >
          {resendIn > 0 ? `Рамзро бори дигар фирист (${resendIn}с)` : "Рамзро бори дигар фирист"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            className="font-semibold text-primary"
            onClick={() => {
              setStep("form");
              clearOtp();
              setError("");
            }}
          >
            Бозгашт
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 id="auth-title" className="text-xl font-bold">
        Сабти ном
      </h2>
      <p className="text-sm text-muted-foreground">
        {isSupabaseConfigured()
          ? "Барои харид ном, email ва парол кифоя аст. Пас аз сабт email-ро тасдиқ мекунед."
          : "Барои харид ном, email ва парол кифоя аст."}
      </p>
      <GoogleButton busy={busy} onClick={withGoogle} label="Сабт бо Google" />
      <AuthDivider />
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
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button className="btn-primary min-h-12 w-full" disabled={busy}>
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
      setTimeout(() => onDone(next || "/"), reduce ? 0 : 420);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хато");
      setBusy(false);
    }
  }

  async function withGoogle() {
    setError("");
    setBusy(true);
    try {
      await startGoogleOAuth(next || "/");
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="relative space-y-3">
      {done && (
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <p className="mt-3 text-sm font-semibold tracking-tight text-ink">Хуш омадед</p>
          <p className="mt-1 text-xs text-muted-foreground">Ба кабинет мегузаред…</p>
        </motion.div>
      )}
      <h2 id="auth-title" className="text-xl font-bold">
        Воридшавӣ
      </h2>
      <GoogleButton busy={busy} onClick={withGoogle} label="Бо Google ворид шавед" />
      <AuthDivider />
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
