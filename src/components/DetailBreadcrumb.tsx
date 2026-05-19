import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface DetailBreadcrumbItem {
  label: string;
  href?: string;
}

export interface DetailBreadcrumbProps {
  items: DetailBreadcrumbItem[];
  /** Optional max width (px) for the final/current item; truncates with ellipsis. */
  currentMaxWidth?: number;
}

export function DetailBreadcrumb({ items, currentMaxWidth = 220 }: DetailBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mt-12 sm:mt-16 border-b border-border/50 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <span key={`${i}-${item.label}`} className="flex items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "text-foreground font-medium truncate" : ""}
                    style={isLast ? { maxWidth: currentMaxWidth } : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3 opacity-50" />}
              </span>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
