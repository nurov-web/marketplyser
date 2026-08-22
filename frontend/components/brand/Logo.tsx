import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect width="36" height="36" rx="10" fill="#2563EB" />
      <path d="M11 26V10h3.4L22 21.2V10h3v16h-3.4L14 14.9V26H11Z" fill="white" />
    </svg>
  );
}

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Nurov Marketplace">
      <LogoMark className="h-9 w-9 shrink-0 shadow-soft transition duration-200 group-hover:brightness-110" />
      {!compact && (
        <span className={`font-sans text-lg font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
          Nurov
        </span>
      )}
    </Link>
  );
}
