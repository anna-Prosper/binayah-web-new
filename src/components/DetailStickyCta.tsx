"use client";

import { StickyMobileCta } from "./StickyMobileCta";

export interface DetailStickyCtaProps {
  /** Pre-built WhatsApp deep link with the encoded `?text=` payload. */
  whatsappUrl: string;
  /** Phone number used for the tel: link (no formatting required — e.g. "+971549988811"). */
  phone: string;
  /** Optional override for the Live Chat anchor target. */
  liveChatHref?: string;
  labels: {
    whatsapp: string;
    call: string;
    liveChat: string;
  };
}

/**
 * Standard 3-button sticky CTA used on every detail page (project + property).
 * Locks the order WhatsApp → Call → Live Chat and the action types so the two
 * pages can't drift apart.
 */
export function DetailStickyCta({ whatsappUrl, phone, liveChatHref = "#live-chat", labels }: DetailStickyCtaProps) {
  return (
    <StickyMobileCta
      actions={[
        { type: "whatsapp", href: whatsappUrl, label: labels.whatsapp },
        { type: "call", href: `tel:${phone}`, label: labels.call },
        { type: "live-chat", href: liveChatHref, label: labels.liveChat },
      ]}
    />
  );
}
