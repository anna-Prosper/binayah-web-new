/* eslint-disable i18next/no-literal-string */
"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

// Off-screen, non-interactive, not announced to screen readers, excluded from
// tab order and autofill. Real users never fill it; naive bots that populate
// every field do — which flags the submission server-side.
const HP_STYLE: CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: "auto",
  width: 1,
  height: 1,
  overflow: "hidden",
  opacity: 0,
};

/**
 * Honeypot bot trap. Usage:
 *   const { value: hp, field } = useHoneypot();
 *   ...render {field} inside the <form>...
 *   ...include `hp` in the JSON payload as `hp`...
 * The server drops any submission where `hp` is non-empty.
 */
export function useHoneypot(): { value: string; field: ReactNode } {
  const [value, setValue] = useState("");
  const field: ReactNode = (
    <div aria-hidden="true" style={HP_STYLE}>
      {/* Named to tempt bots; hidden from humans. */}
      <label>
        Company website
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
    </div>
  );
  return { value, field };
}

/**
 * Static honeypot input for FormData-based forms (no controlled state). Render it
 * inside the <form>, then read the value on submit:
 *   const hp = String(new FormData(e.currentTarget).get("company_website") || "");
 * and post it as `hp`. The server drops any submission where it is non-empty.
 */
export function HoneypotInput() {
  return (
    <div aria-hidden="true" style={HP_STYLE}>
      <label>
        Company website
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

