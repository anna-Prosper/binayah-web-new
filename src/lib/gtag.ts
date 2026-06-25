declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 event. No-ops silently on dev / staging where gtag isn't loaded.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

/** Shorthand for the standard GA4 lead-capture conversion event. */
export function trackLead(params?: { source?: string; project?: string }): void {
  trackEvent("generate_lead", params);
}

/** WhatsApp or phone CTA click. */
export function trackCta(type: "whatsapp" | "phone" | "chat", path?: string): void {
  trackEvent("cta_click", { cta_type: type, page_path: path ?? (typeof window !== "undefined" ? window.location.pathname : "") });
}
