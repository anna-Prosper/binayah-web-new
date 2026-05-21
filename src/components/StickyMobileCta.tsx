"use client";

import { MessageCircle, Phone } from "lucide-react";
import type React from "react";

export type StickyCtaAction =
  | { type: "whatsapp"; href: string; label: string }
  | { type: "call"; href: string; label: string }
  | { type: "live-chat"; href: string; label: string }
  | { type: "custom"; href: string; label: string; icon?: React.ElementType; className?: string };

export interface StickyMobileCtaProps {
  actions: StickyCtaAction[];
}

function actionClass(type: StickyCtaAction["type"]): string {
  switch (type) {
    case "whatsapp":
      return "bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white shadow-md shadow-[#25D366]/20";
    case "call":
      return "text-white shadow-md shadow-accent/20";
    case "live-chat":
      return "border-2 border-primary/30 text-primary";
    default:
      return "";
  }
}

function actionStyle(type: StickyCtaAction["type"]): React.CSSProperties | undefined {
  if (type === "call") return { background: "linear-gradient(to right, #D4A847, #B8922F)" };
  return undefined;
}

function actionIcon(action: StickyCtaAction): React.ElementType {
  if (action.type === "custom") return action.icon ?? MessageCircle;
  if (action.type === "call") return Phone;
  return MessageCircle;
}

export function StickyMobileCta({ actions }: StickyMobileCtaProps) {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2 px-4 py-2.5 max-w-lg mx-auto">
          {actions.map((action, i) => {
            const Icon = actionIcon(action);
            const isExternal = action.type === "whatsapp" || action.type === "custom";
            const baseClass = `flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-[13px] transition-all duration-300 active:scale-[0.97] ${actionClass(action.type)} ${action.type === "custom" ? action.className ?? "" : ""}`;

            // Live chat opens the AI chat widget rather than navigating.
            if (action.type === "live-chat") {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                  className={baseClass}
                  style={actionStyle(action.type)}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            }

            return (
              <a
                key={i}
                href={action.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={baseClass}
                style={actionStyle(action.type)}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </a>
            );
          })}
        </div>
      </div>
      {/* Spacer so page content isn't hidden behind the sticky bar on mobile. */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
