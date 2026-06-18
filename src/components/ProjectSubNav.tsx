"use client";
import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { LayoutGrid, FileText, MapPin, CreditCard } from "lucide-react";

export function ProjectSubNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const t = useTranslations("projectDetail");

  const links = [
    { suffix: "",              label: t("tabOverview"),     Icon: LayoutGrid  },
    { suffix: "floor-plans",   label: t("floorPlansLabel"), Icon: FileText    },
    { suffix: "location",      label: t("tabLocation"),     Icon: MapPin      },
    { suffix: "payment-plan",  label: t("tabPayment"),      Icon: CreditCard  },
  ];

  return (
    <div className="bg-card border-b border-border/50 sticky top-[57px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
        {links.map(({ suffix, label, Icon }) => {
          const href = suffix ? `/project/${slug}/${suffix}` : `/project/${slug}`;
          const isActive = suffix
            ? pathname.endsWith(`/${suffix}`)
            : !["floor-plans", "location", "payment-plan"].some(s => pathname.endsWith(`/${s}`));
          return (
            <Link
              key={suffix}
              href={href as any}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap shrink-0
                ${isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
