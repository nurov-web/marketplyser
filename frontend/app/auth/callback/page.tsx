"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { authErrorMessage } from "@/lib/authErrors";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/Toast";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;

    async function finish(accessToken: string, next: string) {
      await api("/api/auth/oauth", {
        method: "POST",
        body: JSON.stringify({ supabaseAccessToken: accessToken }),
      });
      try {
        await getSupabase().auth.signOut({ scope: "local" });
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      await refresh();
      toast("Хуш омадед!");
      router.replace(next.startsWith("/") ? next : "/");
    }

    async function run() {
      try {
        let next = "/";
        try {
          next = sessionStorage.getItem("auth_next") || params.get("next") || "/";
          sessionStorage.removeItem("auth_next");
        } catch {
          next = params.get("next") || "/";
        }

        const supabase = getSupabase();
        const code = params.get("code");
        const errParam = params.get("error_description") || params.get("error");
        if (errParam) throw new Error(errParam);

        if (code) {
          const { data, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) throw exErr;
          const token = data.session?.access_token;
          if (!token) throw new Error("Сессия аз Google гирифта нашуд.");
          await finish(token, next);
          return;
        }

        // Баъзе ҳолатҳо: токен дар hash (#access_token=...)
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const token = hash.get("access_token");
          if (token) {
            await finish(token, next);
            return;
          }
        }

        const { data, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        const token = data.session?.access_token;
        if (!token) throw new Error("Воридшавӣ бо Google анҷом нашуд. Боз кӯшиш кунед.");
        await finish(token, next);
      } catch (err) {
        if (cancelled) return;
        setError(authErrorMessage(err, "Воридшавӣ бо Google номуваффақ шуд."));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // танҳо як бор
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="container-n flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-red-600" role="alert">
          {error}
        </p>
        <button type="button" className="btn-primary" onClick={() => router.replace("/?auth=register")}>
          Бозгашт
        </button>
      </div>
    );
  }

  return (
    <div className="container-n flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Воридшавӣ бо Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container-n flex min-h-[50vh] items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
