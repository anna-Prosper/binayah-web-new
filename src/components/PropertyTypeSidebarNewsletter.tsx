"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { HoneypotInput } from "@/components/Honeypot";

type SubState = "idle" | "loading" | "done" | "error";

interface PropertyTypeSidebarNewsletterProps {
  slug: string;
  apiUrl: string;
  messages: {
    newsletterTitle: string;
    newsletterDesc: string;
    newsletterEmail: string;
    newsletterCta: string;
    subscribedSuccess: string;
    subscribeError: string;
  };
}

export default function PropertyTypeSidebarNewsletter({ slug, apiUrl, messages }: PropertyTypeSidebarNewsletterProps) {
  const [subState, setSubState] = useState<SubState>("idle");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1.5">
        <Bookmark className="h-4 w-4 text-accent" />
        <h3 className="text-base font-bold text-foreground">{messages.newsletterTitle}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{messages.newsletterDesc}</p>
      {subState === "done" ? (
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {messages.subscribedSuccess}
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const email = fd.get("email");
            if (!email) return;
            const hp = String(fd.get("company_website") || "");
            setSubState("loading");
            try {
              const res = await fetch(`${apiUrl || ""}/api/market-report/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hp, email: String(email), source: `property-type-${slug}` }),
              });
              setSubState(res.ok ? "done" : "error");
            } catch {
              setSubState("error");
            }
          }}
          className="space-y-2.5"
        >
          <HoneypotInput />
          <input
            type="email"
            name="email"
            required
            placeholder={messages.newsletterEmail}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={subState === "loading"}
            className="w-full px-4 py-2.5 rounded-xl text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            {subState === "loading" ? "..." : messages.newsletterCta}
          </button>
          {subState === "error" && <p className="text-xs text-red-500">{messages.subscribeError}</p>}
        </form>
      )}
    </div>
  );
}
