// Single source of truth for WhatsApp deep links.
// Every "chat on WhatsApp" entry point should go through waHref() so the user
// lands in WhatsApp with a pre-typed message (convenience) and we get a
// lightweight attribution line showing which page the lead came from (tracking).

export const WHATSAPP_NUMBER = "971549988811";

// English fallback used on SEO landing pages that don't load the next-intl
// "whatsapp" namespace. Client components should prefer t("whatsapp.prefillGeneral").
export const WA_DEFAULT_MESSAGE =
  "Hi Binayah! 👋 I'd like to know more about your properties in Dubai.";

/**
 * Build a wa.me link with a pre-typed message.
 * @param message  the user-facing pre-typed text
 * @param ref      optional attribution (a page/project URL) appended on its own
 *                 line so the receiving agent sees where the lead came from
 * @param number   optional override (e.g. a project's own WhatsApp number);
 *                 non-digits are stripped. Defaults to the company number.
 */
export function waHref(message: string, ref?: string, number?: string): string {
  const text = ref ? `${message}\n\n🔗 ${ref}` : message;
  const to = (number || WHATSAPP_NUMBER).replace(/[^0-9]/g, "") || WHATSAPP_NUMBER;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}
