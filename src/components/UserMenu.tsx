"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Heart, LogOut, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("userMenu");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />;
  }

  if (!session) {
    if (compact) {
      return (
        <button
          onClick={() => router.push("/signin")}
          className="w-9 h-9 min-w-[44px] min-h-[44px] rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          aria-label={t("signInAriaLabel")}
        >
          <User className="h-4 w-4" />
        </button>
      );
    }
    return (
      <button
        onClick={() => router.push("/signin")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all border border-white/20"
      >
        <User className="h-4 w-4" />
        {t("signIn")}
      </button>
    );
  }

  const avatar = session.user.image ? (
    <Image
      src={session.user.image}
      alt=""
      width={36}
      height={36}
      className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/20"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="w-9 h-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center shrink-0 text-white/80">
      <User className="h-4 w-4" />
    </div>
  );

  // Compact (mobile): avatar links directly to profile, no dropdown
  if (compact) {
    return (
      <Link
        href="/profile"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:opacity-85 transition-opacity"
        aria-label={t("myProfileAriaLabel")}
      >
        {avatar}
      </Link>
    );
  }

  return (
    <div className="relative flex items-center" ref={ref}>
      {/* Avatar — opens dropdown */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full hover:opacity-85 transition-opacity focus:outline-none"
        aria-label={t("accountMenu")}
      >
        {avatar}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border/50 rounded-xl shadow-xl py-1.5 z-50">
          <div className="px-4 py-2.5 border-b border-border/50">
            <p className="text-sm font-semibold text-foreground truncate">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            {t("myProfile")}
          </Link>
          <Link
            href="/profile?tab=saved"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Heart className="h-4 w-4 text-muted-foreground" />
            {t("savedProperties")}
          </Link>
          <div className="border-t border-border/50 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-muted/50 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
