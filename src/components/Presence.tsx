"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Mount/unmount transition without framer-motion — the `AnimatePresence` +
 * `exit` pattern, and nothing else.
 *
 * Why this exists: AIChatWidget, WhatsAppButton and ScrollToTop are statically
 * imported by [locale]/layout.tsx, so they are the ONLY reason framer-motion
 * sits in the shared every-page bundle. All three used the library's simplest
 * case — one conditionally-rendered element fading/scaling in, and out again on
 * close. Keeping an animation library on the critical path of every page for
 * that is a bad trade: on a throttled mobile connection the homepage requests
 * 19 JS chunks in the same millisecond and the LCP hero image queues behind
 * them.
 *
 * The exit animation is the whole difficulty: React removes a child the moment
 * the condition goes false, so there is nothing left to animate out. This keeps
 * the child mounted for `duration` after `show` flips to false, then drops it.
 *
 * Deliberately NOT a general framer replacement. Anything with motion values,
 * layout animations, stagger orchestration or infinite loops should keep using
 * framer-motion (it stays installed, lazily loaded per-route).
 */
export default function Presence({
  show,
  children,
  className,
  style,
  /** Starting/ending scale, mirroring framer's `initial`/`exit` scale. */
  scale = 0.95,
  /** Starting/ending Y offset in px. */
  y = 0,
  duration = 200,
  as: Tag = "div",
  /**
   * Extra CSS properties to keep transitioning. The inline `transition` below
   * overrides any Tailwind `transition-*` class on the same element, so a
   * `hover:bg-*` paired with `transition-colors` would snap instead of fade
   * unless its property is named here.
   */
  alsoTransition,
  ...rest
}: {
  show: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  scale?: number;
  y?: number;
  duration?: number;
  as?: "div" | "button" | "a" | "span";
  alsoTransition?: string;
} & Record<string, unknown>) {
  // Kept mounted through the exit animation.
  const [mounted, setMounted] = useState(show);
  // Drives the enter transition on the frame after mount.
  const [visible, setVisible] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // Two frames: one to commit the hidden state, one to transition from it.
      // A single rAF can be coalesced with the mount paint, which skips the
      // animation entirely.
      //
      // Both handles are tracked so neither frame leaks: cancelling only the
      // outer one would leave the inner frame scheduled after unmount.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        if (inner) cancelAnimationFrame(inner);
      };
    }
    setVisible(false);
    if (reduced.current) {
      setMounted(false);
      return;
    }
    const t = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(t);
  }, [show, duration]);

  if (!mounted) return null;

  return (
    <Tag
      {...rest}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : `translateY(${y}px) scale(${scale})`,
        transition: reduced.current
          ? undefined
          : `opacity ${duration}ms ease-out, transform ${duration}ms ease-out${
              alsoTransition ? `, ${alsoTransition}` : ""
            }`,
      }}
    >
      {children}
    </Tag>
  );
}
