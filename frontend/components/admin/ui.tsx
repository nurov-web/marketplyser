import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  padding = "p-5",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return <div className={`rounded-2xl border border-border/80 bg-white shadow-soft ${padding} ${className}`}>{children}</div>;
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200/80",
  HIDDEN: "bg-slate-100 text-slate-600 ring-slate-200/80",
  REJECTED: "bg-red-50 text-red-700 ring-red-200/80",
  CONFIRMED: "bg-blue-50 text-primary ring-blue-200/80",
  PROCESSING: "bg-sky-50 text-sky-800 ring-sky-200/80",
  SHIPPED: "bg-violet-50 text-violet-800 ring-violet-200/80",
  DELIVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200/80",
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  WARNED: "bg-amber-50 text-amber-800 ring-amber-200/80",
  RESTRICTED: "bg-orange-50 text-orange-800 ring-orange-200/80",
  SUSPENDED: "bg-red-50 text-red-700 ring-red-200/80",
  BANNED: "bg-red-50 text-red-800 ring-red-200/80",
  OPEN: "bg-amber-50 text-amber-800 ring-amber-200/80",
  RESOLVED: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  BLOCKED: "bg-red-50 text-red-700 ring-red-200/80",
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Нашршуда",
  PENDING: "Интизор",
  HIDDEN: "Пинҳон",
  REJECTED: "Радшуда",
  CONFIRMED: "Тасдиқ",
  PROCESSING: "Кор карда истодааст",
  SHIPPED: "Фиристода",
  DELIVERED: "Расонда шуд",
  CANCELLED: "Бекор",
  ACTIVE: "Фаъол",
  WARNED: "Огоҳӣ",
  RESTRICTED: "Маҳдуд",
  SUSPENDED: "Муқаттаъ",
  BANNED: "Блок",
  OPEN: "Кушода",
  RESOLVED: "Ҳал шуд",
  BLOCKED: "Блок",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200/80";
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tone}`}>
      {label}
    </span>
  );
}

export function StatCard({
  href,
  label,
  value,
  icon,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-border/80 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
        <Icon icon={icon} className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
    </Link>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <AdminCard className={`py-14 text-center ${className}`}>
      <p className="font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </AdminCard>
  );
}
