"use client";

import { motion } from "framer-motion";
import type React from "react";

export interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** Element rendered on the right side of the label row (e.g. a currency dropdown). */
  rightSlot?: React.ReactNode;
  /** Stagger delay for the entrance animation. */
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, sub, rightSlot, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-3 sm:p-4 border-l-[3px] border-l-accent border border-border/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-center min-h-[80px] sm:min-h-[92px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-accent flex-shrink-0" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-bold">{label}</p>
        {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      </div>
      <p className="text-[12px] sm:text-sm font-bold text-foreground leading-snug">{value}</p>
      {sub && <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}
