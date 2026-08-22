import type { Role } from "@/types";

export type NavLink = {
  href: string;
  key: "home" | "products" | "shops" | "orders" | "rules" | "compare" | "favorites" | "chat" | "profile" | "sellerPanel" | "adminPanel" | "crm";
  match?: (path: string) => boolean;
};

export const primaryNav: NavLink[] = [
  { href: "/", key: "home", match: (p) => p === "/" },
  { href: "/search", key: "products", match: (p) => p.startsWith("/search") || p.startsWith("/product") },
  { href: "/shops", key: "shops", match: (p) => p.startsWith("/shop") },
  { href: "/orders", key: "orders", match: (p) => p.startsWith("/orders") },
  { href: "/rules", key: "rules", match: (p) => p.startsWith("/rules") },
];

export const extraNav: NavLink[] = [
  { href: "/favorites", key: "favorites" },
  { href: "/compare", key: "compare" },
  { href: "/chat", key: "chat" },
  { href: "/profile", key: "profile" },
];

export function roleNav(role?: Role | null): NavLink[] {
  const items: NavLink[] = [];
  if (role === "SELLER" || role === "ADMIN") items.push({ href: "/seller", key: "sellerPanel" });
  if (role === "ADMIN") {
    items.push({ href: "/admin/crm", key: "crm" });
    items.push({ href: "/admin", key: "adminPanel" });
  }
  return items;
}

export function isActive(href: string, path: string, match?: (p: string) => boolean) {
  if (match) return match(path);
  return path === href || path.startsWith(`${href}/`);
}
