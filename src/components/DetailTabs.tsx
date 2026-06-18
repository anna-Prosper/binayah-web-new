"use client";

import { motion } from "framer-motion";
import { Link } from "@/navigation";

export interface DetailTab<T extends string> {
  id: T;
  label: string;
  /** When set, the tab renders as a locale-aware Link instead of a button. */
  href?: string;
}

export interface DetailTabsProps<T extends string> {
  tabs: ReadonlyArray<DetailTab<T>>;
  active: T;
  onChange?: (id: T) => void;
  /** When true, wraps the container in a motion.div with an entrance animation. */
  animate?: boolean;
  className?: string;
}

export function DetailTabs<T extends string>({ tabs, active, onChange, animate = false, className = "" }: DetailTabsProps<T>) {

  const inner = (
    <>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const cls = `flex-1 relative px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-center ${
          isActive ? "text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-card/50"
        }`;
        const style = isActive ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" } : undefined;
        if (tab.href) {
          return (
            <Link key={tab.id} href={tab.href as any} className={cls} style={style}>
              <span className="relative z-10 uppercase">{tab.label}</span>
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={cls}
            style={style}
          >
            <span className="relative z-10 uppercase">{tab.label}</span>
          </button>
        );
      })}
    </>
  );

  const wrapperClass = `flex gap-1 sm:gap-1.5 bg-muted/50 p-1 sm:p-1.5 rounded-2xl border border-border/50 ${className}`.trim();

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={wrapperClass}
      >
        {inner}
      </motion.div>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
}
