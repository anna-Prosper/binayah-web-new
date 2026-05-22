"use client";

import { useEffect } from "react";

const FALLBACK = "/assets/amenities-placeholder.webp";
const HANDLED = "data-fallback-applied";

// Site-wide safety net for broken images. Catches the bubbling "error"
// event from every <img> on the page (next/image renders a real <img>
// under the hood, so it fires here too) and swaps src + srcset to a
// neutral placeholder. The HANDLED attribute prevents infinite loops if
// the placeholder itself ever fails. Mounted once in the root layout.
export default function GlobalImageFallback() {
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (target.hasAttribute(HANDLED)) return;
      target.setAttribute(HANDLED, "true");
      target.removeAttribute("srcset");
      target.src = FALLBACK;
    };
    // capture:true — image error events do not bubble in some browsers.
    document.addEventListener("error", handler, true);
    return () => document.removeEventListener("error", handler, true);
  }, []);

  return null;
}
