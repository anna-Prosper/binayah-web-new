"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbJsonLd } from "./JsonLd";
import { useTranslations } from "next-intl";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations("breadcrumbs");
  const allItems = [{ label: t("home"), href: "/" }, ...items];

  return (
    <>
      <BreadcrumbJsonLd
        items={allItems.map((item) => ({ name: item.label, href: item.href }))}
      />
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
                {isLast ? (
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    {i === 0 && <Home className="h-3 w-3" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
