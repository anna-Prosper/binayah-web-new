"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK = "/assets/amenities-placeholder.webp";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function ImageWithFallback({ src, alt, fill, width, height, sizes, className, priority }: Props) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setImgSrc(FALLBACK)}
    />
  );
}
