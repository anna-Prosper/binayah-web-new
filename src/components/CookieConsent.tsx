"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

const COOKIE_KEY = "binayah_cookie_consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Cookie storage scoped to the apex domain so www.binayah.ae, binayah.ae,
 * and any future subdomain share the same consent state. Falls back to
 * host-only on localhost or when running under a *.vercel.app preview.
 */
function getConsentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)binayah_cookie_consent=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setConsentCookie(value: string) {
  if (typeof document === "undefined") return;
  // Use apex-scoped Domain on real Binayah hosts so consent persists across
  // www ⇄ apex redirects. Skip Domain on localhost / vercel previews.
  const host = window.location.hostname;
  const apexMatch = host.match(/(?:^|\.)([^.]+\.[a-z]{2,})$/i);
  const isLocal = host === "localhost" || /^127\./.test(host) || host.endsWith(".local");
  const domainAttr = !isLocal && apexMatch ? `; Domain=.${apexMatch[1]}` : "";
  document.cookie =
    `${COOKIE_KEY}=${encodeURIComponent(value)};` +
    ` Max-Age=${ONE_YEAR_SECONDS};` +
    ` Path=/;` +
    ` SameSite=Lax${domainAttr}${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("cookieConsent");

  useEffect(() => {
    // Migration: if a previous localStorage choice exists, promote it to the
    // cross-subdomain cookie so users who accepted under the old system don't
    // see the banner again.
    const cookieConsent = getConsentCookie();
    if (!cookieConsent) {
      try {
        const legacy = localStorage.getItem(COOKIE_KEY);
        if (legacy) {
          setConsentCookie(legacy);
          return;
        }
      } catch { /* localStorage disabled, fall through */ }

      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    setConsentCookie("accepted");
    setVisible(false);
  };

  const decline = () => {
    setConsentCookie("declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium mb-1">{t("title")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("body")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            {t("decline")}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            {t("accept")}
          </button>
        </div>
        <button
          onClick={decline}
          className="absolute top-3 right-3 sm:hidden text-muted-foreground hover:text-foreground"
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
