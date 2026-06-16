export type LeadAction = "view" | "whatsapp" | "phone" | "chat-open" | "inquiry" | "share" | "save";

interface LeadEntity {
  entityType?: string;
  entitySlug?: string | null;
  entityTitle?: string | null;
}

/**
 * Fire-and-forget lead/interaction tracking → the SAME-ORIGIN /api/track route
 * (Next.js handler that writes to userevents, which powers the admin dashboard).
 *
 * We intentionally hit the relative same-origin route, NOT the external API:
 * sendBeacon / keepalive must reach the server even as a WhatsApp/tel click
 * navigates away, and a cross-origin beacon with Content-Type application/json
 * is a non-simple CORS request that the browser silently drops (no preflight).
 * Same-origin avoids CORS entirely and is reliable through navigation.
 */
export function trackLead(action: LeadAction, entity: LeadEntity = {}): void {
  if (typeof window === "undefined") return;
  const url = "/api/track";
  const payload = {
    action,
    entityType: entity.entityType || "unknown",
    entitySlug: entity.entitySlug ?? null,
    entityTitle: entity.entityTitle ?? null,
  };
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking must never break the click */
  }
}
