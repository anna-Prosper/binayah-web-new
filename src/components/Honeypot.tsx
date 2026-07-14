/* eslint-disable i18next/no-literal-string */
"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

// Visually-hidden (a11y sr-only pattern) so it never affects layout or causes a
// scrollbar, aria-hidden so screen readers skip it, tabIndex -1 so keyboard users
// never land on it. The NAME is deliberately NOT an autofill target (no
// name/email/tel/organization/url tokens) and autofill is disabled every way we
// can — so browsers and password managers never fill it for a real user (a false
// positive would silently drop a genuine lead). Naive bots that fill every input
// still populate it, which flags the submission server-side.
const HP_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
  opacity: 0,
};

// Shared attributes that stop browser + password-manager autofill.
const NO_AUTOFILL = {
  tabIndex: -1,
  autoComplete: "off" as const,
  autoCorrect: "off",
  spellCheck: false,
  "data-lpignore": "true", // LastPass
  "data-1p-ignore": "true", // 1Password
  "data-form-type": "other", // Dashlane / generic
};

// Field name — neutral, not an autofill heuristic. Server reads the posted value
// under `hp` (all forms send it as `hp`); this name is only what the DOM input uses.
export const HONEYPOT_FIELD = "hp_check";

/**
 * Honeypot bot trap for controlled (state-based JSON) forms. Usage:
 *   const { value: hp, field } = useHoneypot();
 *   ...render {field} inside the <form>...
 *   ...include `hp` in the JSON payload...
 * The server drops any submission where `hp` is non-empty.
 */
export function useHoneypot(): { value: string; field: ReactNode } {
  const [value, setValue] = useState("");
  const field: ReactNode = (
    <div aria-hidden="true" style={HP_STYLE}>
      <input
        type="text"
        name={HONEYPOT_FIELD}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...NO_AUTOFILL}
      />
    </div>
  );
  return { value, field };
}

/**
 * Static honeypot input for FormData-based forms. Render it inside the <form>,
 * then read the value on submit:
 *   const hp = String(new FormData(e.currentTarget).get("hp_check") || "");
 * and post it as `hp`. The server drops any submission where it is non-empty.
 */
export function HoneypotInput() {
  return (
    <div aria-hidden="true" style={HP_STYLE}>
      <input type="text" name={HONEYPOT_FIELD} defaultValue="" {...NO_AUTOFILL} />
    </div>
  );
}
