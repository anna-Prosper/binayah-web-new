"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Reveal-on-scroll without framer-motion.
 *
 * FeaturedPropertiesClient and OffPlanSectionClient sit directly below the hero
 * — they are in the homepage's critical hydration path — and pulled in all of
 * framer-motion to do `initial` + `whileInView` + `viewport={{ once: true }}`.
 * That is a one-shot fade/slide, which an IntersectionObserver and a CSS
 * transition do natively for a fraction of the parse and execute cost.
 *
 * Deliberately matches the previous framer defaults (0.6s ease-out, 20px
 * travel) so the motion is unchanged on screen.
 *
 * Respects prefers-reduced-motion by rendering in the final state immediately.
 */
export default function Reveal({
  children,
  className,
  style,
  /** Travel distance/direction, mirroring framer's `initial` offset. */
  y = 0,
  x = 0,
  /** Animate width from 0 to this value (the gold rule dividers). */
  width,
  delay = 0,
  as: Tag = "div",
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  y?: number;
  x?: number;
  width?: string;
  delay?: number;
  as?: "div" | "section" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (or reduced motion): show immediately rather than
    // leaving content stuck at opacity 0.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect(); // once: true
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden: CSSProperties = width
    ? { width: 0 }
    : { opacity: 0, transform: `translate(${x}px, ${y}px)` };
  const visible: CSSProperties = width
    ? { width }
    : { opacity: 1, transform: "translate(0, 0)" };

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        ...style,
        ...(shown ? visible : hidden),
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms, width 600ms ease-out ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
