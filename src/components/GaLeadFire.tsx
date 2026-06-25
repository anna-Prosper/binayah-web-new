"use client";

import { useEffect } from "react";
import { trackLead } from "@/lib/gtag";

/** Fires generate_lead once on mount. Drop into server-rendered conversion pages. */
export default function GaLeadFire({ source }: { source: string }) {
  useEffect(() => {
    trackLead({ source });
  }, [source]);
  return null;
}
