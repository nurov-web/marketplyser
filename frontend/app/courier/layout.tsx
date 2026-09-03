"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, MapPinned } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/lib/i18n";

export default function CourierLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { open } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      open("login", { next: "/courier" });
    }
  }, [user, loading, open, router]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">{t("courierOnly")}</div>;
  }

  if (!user) {
    return (
      <div className="container-n py-16 text-center">
        <h1 className="text-2xl font-bold">{t("courierPanel")}</h1>
        <p className="mt-3 text-muted-foreground">{t("courierNeedLogin")}</p>
      </div>
    );
  }

  const canWork = user.role === "COURIER" || user.role === "ADMIN";

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
              {canWork ? t("courierPanel") : t("courierApplyTitle")}
            </h1>
          </div>
        </div>
        {canWork && pathname === "/courier" && (
          <p className="hidden text-sm text-muted-foreground md:block">{t("courierText")}</p>
        )}
      </div>
      {children}
    </div>
  );
}
