"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Reveal-on-scroll (or on-mount) without framer-motion.
 *
 * Originally written for FeaturedPropertiesClient and OffPlanSectionClient —
 * homepage sections in the critical hydration path that pulled in all of
 * framer-motion to do `initial` + `whileInView` + `viewport={{ once: true }}`.
 * That's a one-shot fade/slide/scale, which an IntersectionObserver and a CSS
 * transition do natively for a fraction of the parse and execute cost.
 * Since then, extended to cover every framer usage in the codebase that is
 * ONLY `initial`+`animate`(+`whileInView`) with no `exit` — i.e. every
 * one-shot entrance animation, whether scroll-triggered or immediate. See
 * src/components/Presence.tsx for the separate mount/unmount (`exit`) case.
 *
 * `trigger="mount"` animates immediately (mirrors bare `initial`+`animate`,
 * no scroll gate). `trigger="scroll"` (default) waits for the element to
 * enter the viewport (mirrors `whileInView`+`viewport={{once:true}}`).
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
  /** Starting scale, mirroring framer's `initial={{ scale }}`. 1 = no scale animation. */
  scale = 1,
  /** Animate width from 0 to this value (the gold rule dividers). */
  width,
  delay = 0,
  duration = 600,
  trigger = "scroll",
  as: Tag = "div",
  ...rest
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  y?: number;
  x?: number;
  scale?: number;
  width?: string;
  delay?: number;
  duration?: number;
  trigger?: "scroll" | "mount";
  as?: "div" | "section" | "article" | "li" | "form";
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }

    if (trigger === "mount") {
      // Two frames: one to commit the hidden state, one to transition from it.
      // A single rAF can be coalesced with the mount paint and skip the
      // animation. Same fix as Presence.tsx's enter transition.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        if (inner) cancelAnimationFrame(inner);
      };
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
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
  }, [trigger]);

  const hidden: CSSProperties = width
    ? { width: 0 }
    : { opacity: 0, transform: `translate(${x}px, ${y}px)${scale !== 1 ? ` scale(${scale})` : ""}` };
  const visible: CSSProperties = width ? { width } : { opacity: 1, transform: "translate(0, 0) scale(1)" };

  return (
    <Tag
      {...rest}
      ref={ref as never}
      className={className}
      style={{
        ...style,
        ...(shown ? visible : hidden),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms, width ${duration}ms ease-out ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
