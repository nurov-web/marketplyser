"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/hooks/useAuthModal";

export default function RegisterPage() {
  const { open } = useAuthModal();
  const router = useRouter();
  useEffect(() => {
    open("register");
    router.replace("/");
  }, [open, router]);
  return <div className="min-h-[40vh]" />;
}
