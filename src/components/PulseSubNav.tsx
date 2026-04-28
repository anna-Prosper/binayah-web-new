"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Activity, TrendingUp, BarChart2, Calculator, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", href: "/pulse", icon: Activity },
  { id: "trending", href: "/pulse/trending", icon: TrendingUp },
  { id: "compare", href: "/pulse/compare", icon: BarChart2 },
  { id: "calculator", href: "/pulse/calculator", icon: Calculator },
  { id: "guides", href: "/pulse/guides", icon: BookOpen },
] as const;

export default function PulseSubNav() {
  const t = useTranslations("pulseSubNav");
  const locale = useLocale();
  const pathname = usePathname();

  // Normalise pathname — strip locale prefix e.g. /en/pulse/trending → /pulse/trending
  const localePrefixes = ["/en", "/ar", "/zh", "/ru"];
  let normPath = pathname;
  for (const prefix of localePrefixes) {
    if (normPath.startsWith(prefix + "/") || normPath === prefix) {
      normPath = normPath.slice(prefix.length) || "/";
      break;
    }
  }

  const isActive = (href: string) => {
    if (href === "/pulse") {
      return normPath === "/pulse" || normPath === "/pulse/";
    }
    return normPath.startsWith(href);
  };

  return (
    <nav
      className="sticky top-[80px] z-30 w-full bg-background/95 backdrop-blur-sm border-b border-border/50"
      aria-label={t("navLabel")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-3">
          {NAV_ITEMS.map(({ id, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={`/${locale}${href}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex-shrink-0 ${
                  active
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                style={
                  active
                    ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }
                    : undefined
                }
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {t(id as "overview" | "trending" | "compare" | "calculator" | "guides")}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
