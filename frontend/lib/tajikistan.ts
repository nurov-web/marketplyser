/** Wikipedia location-map bounds (Tajikistan rel location map). */
export const TJ_BOUNDS = { west: 67.1, east: 75.5, south: 36.4, north: 41.3 };

/** Simplified Tajikistan outline (lng, lat). */
export const TJ_OUTLINE: [number, number][] = [
  [67.57, 37.4],
  [67.82, 37.12],
  [68.22, 36.86],
  [68.78, 36.67],
  [69.32, 36.76],
  [69.92, 37.08],
  [70.52, 37.38],
  [71.12, 37.5],
  [71.62, 37.64],
  [72.18, 37.4],
  [72.84, 37.3],
  [73.52, 37.46],
  [74.2, 37.28],
  [74.96, 37.24],
  [75.15, 37.7],
  [74.98, 38.12],
  [74.86, 38.5],
  [74.38, 38.78],
  [73.96, 39.16],
  [73.7, 39.56],
  [73.28, 39.48],
  [72.74, 39.66],
  [72.4, 40.08],
  [72.22, 40.42],
  [71.82, 40.22],
  [71.28, 39.96],
  [70.66, 39.98],
  [70.28, 40.48],
  [69.84, 40.68],
  [69.42, 41.05],
  [68.72, 40.94],
  [68.12, 40.82],
  [67.52, 40.28],
  [67.34, 39.46],
  [67.05, 38.48],
  [67.24, 37.88],
  [67.57, 37.4],
];

export const TJ_CITIES = [
  { name: "Душанбе", lat: 38.5598, lng: 68.7738 },
  { name: "Хуҷанд", lat: 40.2822, lng: 69.6222 },
  { name: "Кӯлоб", lat: 37.9146, lng: 69.7845 },
  { name: "Бохтар", lat: 37.8363, lng: 68.7803 },
  { name: "Истаравшан", lat: 39.9142, lng: 69.0063 },
  { name: "Панҷакент", lat: 39.4953, lng: 67.6093 },
  { name: "Хоруғ", lat: 37.4897, lng: 71.549 },
  { name: "Турсунзода", lat: 38.5126, lng: 68.2306 },
  { name: "Ваҳдат", lat: 38.5531, lng: 69.0136 },
  { name: "Исфара", lat: 40.1265, lng: 70.6253 },
];

const W = 1191;
const H = 903;

export function project(lng: number, lat: number) {
  const x = ((lng - TJ_BOUNDS.west) / (TJ_BOUNDS.east - TJ_BOUNDS.west)) * W;
  const y = ((TJ_BOUNDS.north - lat) / (TJ_BOUNDS.north - TJ_BOUNDS.south)) * H;
  return { x, y };
}

export function outlinePath() {
  return TJ_OUTLINE.map(([lng, lat], i) => {
    const { x, y } = project(lng, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

export const MAP_SIZE = { w: W, h: H };
