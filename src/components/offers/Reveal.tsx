"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Stagger within a group, in ms. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared reveal registry.
//
// IntersectionObserver alone is NOT sufficient here. It only notifies on
// threshold crossings, so an element that goes from below the fold to above it
// between two ticks — an anchor jump, a scrollbar drag, a fast flick — never
// reports as intersecting and would stay at opacity 0 permanently. (Measured:
// jumping straight to the page bottom revealed 1 of 18 elements.)
//
// So: the observer handles the normal case with its stagger, and one shared,
// rAF-throttled scroll/resize pass sweeps up anything the reader has already
// passed. One listener for the whole page rather than one per element.
// ─────────────────────────────────────────────────────────────────────────────

const pending = new Map<Element, number>(); // element → stagger delay
let listening = false;
let queued = false;

function reveal(el: Element, delayMs: number) {
  (el as HTMLElement).style.transitionDelay = `${delayMs}ms`;
  el.classList.add("is-in");
  pending.delete(el);
  if (pending.size === 0) stopListening();
}

function sweep() {
  queued = false;
  const h = window.innerHeight;
  for (const [el, delayMs] of pending) {
    const r = el.getBoundingClientRect();
    // Visible (even partially) OR already scrolled past the top.
    if (r.top < h * 0.92 && r.bottom > 0) reveal(el, delayMs);
    else if (r.bottom <= 0) reveal(el, 0); // behind the reader — no animation
  }
}

function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(sweep);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
}

/**
 * Fades + lifts its children the first time they scroll into view.
 *
 * The visual work lives in CSS (.ofr-reveal / .is-in in globals.css), which
 * keeps the prefers-reduced-motion opt-out in one place.
 */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    pending.set(el, delay);
    startListening();
    // Catch anything already on screen at mount (deep link, restored scroll).
    onScroll();

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target, pending.get(entry.target) ?? 0);
          io?.unobserve(entry.target);
        },
        // Fire slightly before the element is fully on screen so the motion has
        // finished by the time the reader's eye arrives.
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(el);
    } else {
      // No observer support — the scroll sweep above already handles it, but
      // make sure a no-JS-motion browser never hides content.
      el.classList.add("is-in");
      pending.delete(el);
    }

    return () => {
      io?.disconnect();
      pending.delete(el);
      if (pending.size === 0) stopListening();
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`ofr-reveal ${className}`}>
      {children}
    </Tag>
  );
}
