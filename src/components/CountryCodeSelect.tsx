/* eslint-disable i18next/no-literal-string */
"use client";

import { useId, useMemo } from "react";
import { COUNTRIES, flagEmoji } from "@/lib/country-codes";

interface Props {
  value: string;
  onChange: (dial: string) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

// When several countries share a dial code (US/Canada both +1, UK/Guernsey/
// Jersey/Isle of Man all +44, Russia/Kazakhstan both +7, ...) we keep one
// canonical entry per dial code so the rendered select stays unambiguous.
// The phone number is dialed identically either way.
const PREFERRED_ISO_PER_DIAL: Record<string, string> = {
  "+1": "US",
  "+7": "RU",
  "+44": "GB",
  "+47": "NO",
  "+61": "AU",
  "+39": "IT",
  "+212": "MA",
  "+262": "RE",
  "+590": "GP",
  "+599": "CW",
};

export default function CountryCodeSelect({ value, onChange, className, style, ariaLabel }: Props) {
  const id = useId();

  const options = useMemo(() => {
    const byDial = new Map<string, { iso: string; name: string; dial: string }>();
    for (const c of COUNTRIES) {
      const existing = byDial.get(c.dial);
      const preferred = PREFERRED_ISO_PER_DIAL[c.dial];
      if (!existing) {
        byDial.set(c.dial, c);
      } else if (preferred === c.iso) {
        byDial.set(c.dial, c);
      }
    }
    return Array.from(byDial.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <select
      id={id}
      aria-label={ariaLabel ?? "Country code"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={style}
    >
      {options.map((c) => (
        <option key={c.iso} value={c.dial}>
          {flagEmoji(c.iso)} {c.dial} {c.name}
        </option>
      ))}
    </select>
  );
}
