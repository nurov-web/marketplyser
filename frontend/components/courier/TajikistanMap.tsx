"use client";

import { MAP_SIZE, project } from "@/lib/tajikistan";

export type MapLoad = {
  id: string;
  lat: number;
  lng: number;
  km: number;
  number: number;
  city: string;
  status: string;
  fullName: string;
};

export function TajikistanMap({
  loads,
  selectedId,
  onSelect,
}: {
  loads: MapLoad[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { w, h } = MAP_SIZE;

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
        aria-label="Ҷойҳои расонидан"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="pin" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#0f172a" floodOpacity="0.35" />
          </filter>
        </defs>
        {loads.map((load) => {
          const p = project(load.lng, load.lat);
          const on = load.id === selectedId;
          const labelOnLeft = p.x > w * 0.68;
          const hitR = on ? 48 : 44;
          return (
            <g
              key={load.id}
              className="cursor-pointer"
              role="button"
              aria-label={load.fullName}
              onClick={() => onSelect(load.id)}
              filter="url(#pin)"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hitR}
                fill={on ? "#ea580c" : "#0f766e"}
                fillOpacity={on ? 0.2 : 0.14}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={on ? 16 : 12}
                fill={on ? "#ea580c" : "#0f766e"}
                stroke="#fff"
                strokeWidth={on ? 3 : 2.5}
              />
              <circle cx={p.x} cy={p.y} r={on ? 5 : 4} fill="#fff" />
              <text
                x={p.x + (labelOnLeft ? -hitR + 4 : hitR - 4)}
                y={p.y + 5}
                textAnchor={labelOnLeft ? "end" : "start"}
                fill="#fff"
                stroke="#1e293b"
                strokeWidth="3.5"
                paintOrder="stroke"
                fontSize={on ? 16 : 14}
                fontWeight={on ? 800 : 700}
              >
                {load.fullName}
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
