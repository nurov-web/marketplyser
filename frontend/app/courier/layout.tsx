"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, MapPinned } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/lib/i18n";

export default function CourierLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login?next=/courier");
    else if (user.role !== "COURIER" && user.role !== "ADMIN") router.push("/");
  }, [user, loading, router]);

  if (loading || !user || (user.role !== "COURIER" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {t("courierOnly")}
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-slate-200">
            <Icon icon={ArrowLeft} className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Nurov</p>
            <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
              <Icon icon={MapPinned} className="h-5 w-5 text-primary" />
              {t("courierPanel")}
            </h1>
          </div>
        </div>
        <p className="hidden text-sm text-muted-foreground md:block">{pathname === "/courier" ? t("courierText") : ""}</p>
      </div>
      {children}
    </div>
  );
}
