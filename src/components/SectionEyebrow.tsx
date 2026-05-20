import type React from "react";

export interface SectionEyebrowProps {
  /** Small uppercase tracked label above the title (e.g. "About the project"). */
  eyebrow: string;
  /** Main heading text. */
  title: string;
  /** Optional spacing wrapper override. */
  className?: string;
  /** Render `as` for the heading element (defaults to h2). */
  as?: "h1" | "h2" | "h3";
}

/**
 * Standard "eyebrow + title" section header used across detail-page content
 * (description, highlights, location, etc.). Locks the gradient accent bar,
 * eyebrow size/tracking, and title sizing so every section block lines up.
 */
export function SectionEyebrow({ eyebrow, title, className = "mb-5", as = "h2" }: SectionEyebrowProps) {
  const Heading = as as React.ElementType;
  return (
    <div className={className}>
      <div className="h-[2px] w-8 rounded-full bg-gradient-to-r from-accent to-accent/60 mb-3" />
      <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent mb-1.5">{eyebrow}</p>
      <Heading className="text-lg sm:text-2xl font-bold text-foreground leading-tight">{title}</Heading>
    </div>
  );
}
