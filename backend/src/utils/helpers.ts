export function toNum(value: { toNumber?: () => number } | number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "object" && typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function publicUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  accountStatus: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
  };
}

export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "item"}-${Date.now().toString(36)}`;
}

export function finalPrice(price: number, discount: number) {
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}
