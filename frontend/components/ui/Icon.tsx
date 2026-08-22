import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  className?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
};

export function Icon({ icon: Lucide, className, ...props }: Props) {
  return <Lucide strokeWidth={1.9} className={className} {...props} />;
}
