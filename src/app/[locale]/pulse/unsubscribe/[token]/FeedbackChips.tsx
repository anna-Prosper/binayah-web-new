"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface FeedbackOption {
  key: string;
  label: string;
}

interface Props {
  options: FeedbackOption[];
}

/**
 * Interactive feedback chips for the unsubscribe page.
 * Selection is local-only — non-blocking, no submission required.
 * Selected state: gold ring (#D4A847), deselected: default border.
 */
export default function FeedbackChips({ options }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.has(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all min-h-[32px] border ${
              isSelected
                ? "bg-[#D4A847]/10 border-[#D4A847] text-[#0B3D2E] ring-1 ring-[#D4A847]"
                : "bg-background border-border text-muted-foreground hover:border-[#D4A847] hover:text-foreground"
            }`}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="h-3 w-3 flex-shrink-0" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
