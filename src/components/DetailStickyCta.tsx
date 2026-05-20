"use client";

import { useTranslations } from "next-intl";
import { StickyMobileCta } from "./StickyMobileCta";

export interface DetailStickyCtaProps {
  /** Pre-built WhatsApp deep link with the encoded `?text=` payload. */
  whatsappUrl: string;
  /** Phone number used for the tel: link (no formatting required — e.g. "+971549988811"). */
  phone: string;
  /** Optional override for the Live Chat anchor target. */
  liveChatHref?: string;
}

/**
 * Standard 3-button sticky CTA used on every detail page (project + property).
 * Locks the order WhatsApp → Call → Live Chat AND owns its labels via the
 * shared `whatsapp` translation namespace so call sites don't have to know
 * which keys to pass.
 */
export function DetailStickyCta({ whatsappUrl, phone, liveChatHref = "#live-chat" }: DetailStickyCtaProps) {
  const t = useTranslations("whatsapp");
  return (
    <StickyMobileCta
      actions={[
        { type: "whatsapp", href: whatsappUrl, label: t("whatsapp") },
        { type: "call", href: `tel:${phone}`, label: t("call") },
        { type: "live-chat", href: liveChatHref, label: t("liveChat") },
      ]}
    />
  );
}
