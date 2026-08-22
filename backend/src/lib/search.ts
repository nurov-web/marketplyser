export function ilike(q: string) {
  return { contains: q, mode: "insensitive" as const };
}
