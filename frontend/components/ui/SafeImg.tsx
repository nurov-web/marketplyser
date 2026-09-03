"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { mediaUrl } from "@/lib/api";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

export function SafeImg({ src, alt = "", className, fallbackClassName, onError, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);

  if (!url || failed) {
    return <span className={`block bg-slate-100 ${fallbackClassName || className || ""}`} aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
