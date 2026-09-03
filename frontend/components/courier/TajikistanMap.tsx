"use client";

import { MAP_SIZE, project, TJ_CITIES } from "@/lib/tajikistan";

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
    <div className="relative h-full w-full bg-[#c9d6b8]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/maps/tajikistan-relief.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Харитаи Тоҷикистон"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="pin" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#0f172a" floodOpacity="0.35" />
          </filter>
        </defs>
        {TJ_CITIES.map((c) => {
          const p = project(c.lng, c.lat);
          return (
            <g key={c.name}>
              <circle cx={p.x} cy={p.y} r="3" fill="#0f172a" />
              <text
                x={p.x + 7}
                y={p.y + 4}
                fill="#fff"
                stroke="#1e293b"
                strokeWidth="3"
                paintOrder="stroke"
                fontSize="13"
                fontWeight="700"
              >
                {c.name}
              </text>
            </g>
          );
        })}
        {from && to && (
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#1d4ed8"
            strokeWidth="3"
            strokeDasharray="7 6"
            strokeLinecap="round"
          />
        )}
        {from && (
          <g filter="url(#pin)">
            <circle cx={from.x} cy={from.y} r="18" fill="#2563eb" fillOpacity="0.18" />
            <circle cx={from.x} cy={from.y} r="9" fill="#2563eb" stroke="#fff" strokeWidth="2.5" />
          </g>
        )}
        {loads.map((load) => {
          const p = project(load.lng, load.lat);
          const on = load.id === selectedId;
          return (
            <g
              key={load.id}
              className="cursor-pointer"
              onClick={() => onSelect(load.id)}
              filter="url(#pin)"
            >
              <circle cx={p.x} cy={p.y} r={on ? 22 : 16} fill={on ? "#ea580c" : "#f59e0b"} fillOpacity="0.22" />
              <circle cx={p.x} cy={p.y} r={on ? 14 : 11} fill={on ? "#ea580c" : "#f59e0b"} stroke="#fff" strokeWidth="2.5" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">
                {load.number.toString().slice(-2)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600">
        Wikimedia Commons · CC BY-SA
      </p>
    </div>
  );
}
