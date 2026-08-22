const KEY = "nurov-compare";

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toggleCompare(id: string) {
  const ids = getCompareIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-3);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function inCompare(id: string) {
  return getCompareIds().includes(id);
}
