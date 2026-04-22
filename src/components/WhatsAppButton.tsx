"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const WhatsAppButton = () => {
  const t = useTranslations("whatsapp");
  return (
  <>
    {/* Desktop: floating WhatsApp bubble */}
    <motion.a
      href="https://wa.me/971549988811"
      target="_blank"
      rel="noopener noreferrer"
      className="hidden sm:flex fixed bottom-24 right-6 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full items-center justify-center shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-1 transition-all"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200 }}
      aria-label={t("ariaLabel")}
    >
      <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </motion.a>

    {/* Mobile: sticky bottom CTA bar */}
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex gap-2 px-4 py-2.5 max-w-lg mx-auto">
        <a
          href="https://wa.me/971549988811?text=Hi, I'm interested in your property services"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold text-[13px] shadow-md shadow-[#25D366]/20 active:scale-[0.97] transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          {t("whatsapp")}
        </a>
        <a
          href="tel:+971549988811"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-white font-bold text-[13px] shadow-md shadow-accent/20 active:scale-[0.97] transition-all"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
        >
          <Phone className="h-4 w-4" />
          {t("call")}
        </a>
        <button
          onClick={() => {
            const chatBtn = document.querySelector<HTMLButtonElement>('[data-chat-trigger]');
            if (chatBtn) chatBtn.click();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border-2 border-primary/30 text-primary font-bold text-[13px] active:scale-[0.97] transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          {t("liveChat")}
        </button>
      </div>
    </div>

    {/* Spacer so content isn't hidden behind the mobile bar */}
    <div className="h-16 sm:hidden" />
  </>
  );
};

export default WhatsAppButton;
