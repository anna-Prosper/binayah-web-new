"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records where the session came from, once, on arrival.
 *
 * Deliberately NOT part of ProdAnalytics: that is gated to production hosts
 * because it injects third-party scripts (GTM/GA/Clarity/LiveChat). This is
 * first-party data about our own leads, it loads nothing external, and a lead
 * submitted from a preview host deserves its source recorded too.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
