import { apiUrl } from "@/lib/api";

export type LeadAction = "view" | "whatsapp" | "phone" | "chat-open" | "inquiry" | "share" | "save";

interface LeadEntity {
  entityType?: string;
  entitySlug?: string | null;
  entityTitle?: string | null;
}

/**
 * Fire-and-forget lead/interaction tracking → /api/track (userevents, powers the
 * admin dashboard). Uses navigator.sendBeacon (with a keepalive fetch fallback)
 * because WhatsApp/tel CTAs navigate away immediately — a plain fetch is often
 * cancelled mid-flight before it reaches the server, undercounting leads.
 */
export function trackLead(action: LeadAction, entity: LeadEntity = {}): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      action,
      entityType: entity.entityType || "unknown",
      entitySlug: entity.entitySlug ?? null,
      entityTitle: entity.entityTitle ?? null,
    });
    const url = apiUrl("/api/track");
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
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
