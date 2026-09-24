"use client";

import { useState, useEffect } from "react";
import Presence from "@/components/Presence";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("scrollToTop");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Presence
      show={visible}
      as="button"
      scale={0.8}
      alsoTransition="background-color 150ms ease-out"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-6 z-40 w-11 h-11 bg-foreground/80 hover:bg-foreground rounded-full hidden sm:flex items-center justify-center shadow-lg transition-colors"
      aria-label={t("ariaLabel")}
    >
      <ArrowUp className="h-4 w-4 text-background" />
    </Presence>
  );
};

export default ScrollToTop;
