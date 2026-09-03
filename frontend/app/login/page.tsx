"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal } from "@/hooks/useAuthModal";

function LoginOpener() {
  const { open } = useAuthModal();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  useEffect(() => {
    open("login", { next });
    router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }, [open, router, next]);
  return <div className="min-h-[40vh]" />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginOpener />
    </Suspense>
  );
}
