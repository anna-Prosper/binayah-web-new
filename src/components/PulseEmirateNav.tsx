"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, Link } from "@/navigation";
import { Activity, TrendingUp, BarChart2, Calculator, BookOpen, Globe } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", href: "/pulse", icon: Activity },
  { id: "trending", href: "/pulse/trending", icon: TrendingUp },
  { id: "compare", href: "/pulse/compare", icon: BarChart2 },
  { id: "calculator", href: "/pulse/calculator", icon: Calculator },
  { id: "guides", href: "/pulse/guides", icon: BookOpen },
] as const;

const EMIRATE_ITEMS = [
  { id: "dubai", href: "/pulse/emirate/dubai", icon: Globe },
] as const;

// "Coming soon" items that render as editorial footnote text with badge
const COMING_SOON_ITEMS = [
  { id: "abuDhabi" },
  { id: "sharjah" },
  { id: "rak" },
  { id: "ajman" },
] as const;

export default function PulseEmirateNav() {
  const t = useTranslations("pulseEmirateNav");
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/pulse") {
      return pathname === "/pulse" || pathname === "/pulse/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="sticky top-[80px] z-30 w-full bg-background/95 backdrop-blur-sm border-b border-border/50"
      aria-label={t("navLabel")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide py-0">

          {/* Primary pulse nav items — underline-active, never pills */}
          {NAV_ITEMS.map(({ id, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={href}
                locale={locale}
                className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all min-h-[44px] flex-shrink-0 border-b-2 ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                }`}
                style={active ? { borderColor: "#D4A847" } : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {t(id as "overview" | "trending" | "compare" | "calculator" | "guides")}
              </Link>
            );
          })}

          {/* Subtle separator */}
          <div className="h-4 w-px bg-border/50 mx-2 flex-shrink-0" />

          {/* Emirate items */}
          {EMIRATE_ITEMS.map(({ id, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={href}
                locale={locale}
                className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all min-h-[44px] flex-shrink-0 border-b-2 ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                }`}
                style={active ? { borderColor: "#D4A847" } : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {t(id as "dubai")}
              </Link>
            );
          })}

          {/* Coming soon — editorial footnote style with badge */}
          {COMING_SOON_ITEMS.map(({ id }) => (
            <span
              key={id}
              title={t("comingSoonTooltip")}
              className="relative flex items-center gap-1 px-4 py-3.5 text-[11px] font-medium whitespace-nowrap min-h-[44px] flex-shrink-0 cursor-not-allowed select-none border-b-2 border-transparent opacity-60"
              style={{
                color: "hsl(43, 55%, 55%)",
                letterSpacing: "0.08em",
              }}
              aria-label={`${t(id as "abuDhabi" | "sharjah" | "rak" | "ajman")} — ${t("comingSoonTooltip")}`}
            >
              {t(id as "abuDhabi" | "sharjah" | "rak" | "ajman")}
              <span
                className="ml-1.5 text-[9px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: "#A88735" }}
              >
                {t("comingSoon")}
              </span>
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}
