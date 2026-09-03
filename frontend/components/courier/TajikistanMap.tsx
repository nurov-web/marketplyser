"use client";

import { MAP_SIZE, outlinePath, project, TJ_CITIES } from "@/lib/tajikistan";

export type MapLoad = {
  id: string;
  lat: number;
  lng: number;
  km: number;
  number: number;
  city: string;
  status: string;
};

export function TajikistanMap({
  loads,
  origin,
  selectedId,
  onSelect,
}: {
  loads: MapLoad[];
  origin: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { w, h } = MAP_SIZE;
  const selected = loads.find((l) => l.id === selectedId);
  const from = origin ? project(origin.lng, origin.lat) : null;
  const to = selected ? project(selected.lng, selected.lat) : null;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" role="img" aria-label="Харитаи Тоҷикистон">
      <defs>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8eef7" />
          <stop offset="100%" stopColor="#d5e0f0" />
        </linearGradient>
        <filter id="soft" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0b1f4b" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width={w} height={h} fill="#0b1f4b" />
      <path d={outlinePath()} fill="url(#land)" stroke="#93c5fd" strokeWidth="2.2" filter="url(#soft)" />
      {TJ_CITIES.map((c) => {
        const p = project(c.lng, c.lat);
        return (
          <g key={c.name}>
            <circle cx={p.x} cy={p.y} r="3.2" fill="#1e3a5f" />
            <text x={p.x + 6} y={p.y + 3.5} fill="#334155" fontSize="11" fontWeight="600">
              {c.name}
            </text>
          </g>
        );
      })}
      {from && to && (
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#2563eb" strokeWidth="2" strokeDasharray="6 6" />
      )}
      {from && (
        <g>
          <circle cx={from.x} cy={from.y} r="8" fill="#2563eb" />
          <circle cx={from.x} cy={from.y} r="14" fill="none" stroke="#2563eb" strokeOpacity="0.35" strokeWidth="2" />
        </g>
      )}
      {loads.map((load) => {
        const p = project(load.lng, load.lat);
        const on = load.id === selectedId;
        return (
          <g key={load.id} className="cursor-pointer" onClick={() => onSelect(load.id)}>
            <circle cx={p.x} cy={p.y} r={on ? 13 : 9} fill={on ? "#ea580c" : "#f59e0b"} stroke="#fff" strokeWidth="2" />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="800">
              {load.number.toString().slice(-2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
