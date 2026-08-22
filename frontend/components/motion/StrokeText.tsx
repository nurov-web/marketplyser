"use client";

import { useReducedMotion } from "framer-motion";

export function StrokeText({
  text,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const reduce = useReducedMotion();
  return (
    <Tag className={`stroke-text ${reduce ? "stroke-text-static" : ""} ${className}`.trim()}>
      {text}
    </Tag>
  );
}
