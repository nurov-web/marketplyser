export const DUSHANBE = { lat: 38.5598, lng: 68.7738 };

export const TJ_CITIES: { keys: string[]; lat: number; lng: number; name: string }[] = [
  { name: "Душанбе", lat: 38.5598, lng: 68.7738, keys: ["душанбе", "dushanbe"] },
  { name: "Хуҷанд", lat: 40.2822, lng: 69.6222, keys: ["хуҷанд", "худжанд", "khujand", "суғд"] },
  { name: "Кӯлоб", lat: 37.9146, lng: 69.7845, keys: ["кӯлоб", "кулоб", "kulob", "kulyab"] },
  { name: "Бохтар", lat: 37.8363, lng: 68.7803, keys: ["бохтар", "қурғонтеппа", "кургонтеппа", "bokhtar"] },
  { name: "Истаравшан", lat: 39.9142, lng: 69.0063, keys: ["истаравшан", "istaravshan"] },
  { name: "Панҷакент", lat: 39.4953, lng: 67.6093, keys: ["панҷакент", "пенджикент", "panjakent"] },
  { name: "Хоруғ", lat: 37.4897, lng: 71.549, keys: ["хоруғ", "хорог", "khorugh", "khorog"] },
  { name: "Турсунзода", lat: 38.5126, lng: 68.2306, keys: ["турсунзода", "tursunzoda"] },
  { name: "Ваҳдат", lat: 38.5531, lng: 69.0136, keys: ["ваҳдат", "вахдат", "vahdat"] },
  { name: "Ҳисор", lat: 38.525, lng: 68.5512, keys: ["ҳисор", "гиссар", "hisor", "hissar"] },
  { name: "Исфара", lat: 40.1265, lng: 70.6253, keys: ["исфара", "isfara"] },
  { name: "Конибодом", lat: 40.2943, lng: 70.4312, keys: ["конибодом", "қанибодом", "konibodom"] },
  { name: "Леваканд", lat: 37.8667, lng: 68.9167, keys: ["леваканд", "сино", "levakand"] },
  { name: "Рашт", lat: 39.052, lng: 70.374, keys: ["рашт", "ғарам", "rasht"] },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/ӣ/g, "и")
    .replace(/ӯ/g, "у")
    .replace(/ҳ/g, "х")
    .replace(/қ/g, "к")
    .replace(/ҷ/g, "ч")
    .replace(/ғ/g, "г")
    .trim();
}

export function geocodeCity(city: string) {
  const n = norm(city || "");
  const hit = TJ_CITIES.find((c) => c.keys.some((k) => n.includes(norm(k)) || norm(k).includes(n)));
  return hit ? { lat: hit.lat, lng: hit.lng, name: hit.name } : { ...DUSHANBE, name: city || "Душанбе" };
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)) * 10) / 10;
}

export function jitter(id: string, lat: number, lng: number) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  const u = ((h >>> 0) % 80) - 40;
  const v = (((h >>> 8) % 80) - 40);
  return { lat: lat + u * 0.0014, lng: lng + v * 0.0018 };
}
