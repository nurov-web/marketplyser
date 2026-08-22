const KEY = "nurov-recent";

export function rememberProduct(id: string) {
  if (typeof window === "undefined" || !id) return;
  const ids = getRecentIds().filter((x) => x !== id);
  ids.unshift(id);
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, 12)));
}

export function getRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
