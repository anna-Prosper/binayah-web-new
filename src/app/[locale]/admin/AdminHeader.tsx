"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface AdminHeaderProps {
  title: string;
  backHref?: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export default function AdminHeader({ title, backHref, name, email, avatar }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const initials = name?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="bg-[#0B3D2E] text-white px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: back or logo */}
        <div className="flex items-center gap-2 min-w-0">
          {backHref ? (
            <a
              href={backHref}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors shrink-0"
              aria-label="Back to dashboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm hidden sm:inline">Dashboard</span>
            </a>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#D4A847] flex items-center justify-center font-bold text-[#0B3D2E] text-sm shrink-0">
              B
            </div>
          )}

          <div className="min-w-0">
            {backHref ? (
              <>
                <span className="text-white/30 mx-1.5 hidden sm:inline">/</span>
                <span className="font-semibold text-sm truncate">{title}</span>
              </>
            ) : (
              <div>
                <div className="font-semibold text-sm leading-tight">Binayah Admin</div>
                <div className="text-white/50 text-xs leading-tight truncate hidden sm:block">{title}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: avatar dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full object-cover border-2 border-white/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold border-2 border-white/20">
                {initials}
              </div>
            )}
            {/* Chevron */}
            <svg
              className={`w-3.5 h-3.5 text-white/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 text-left">
              {/* Identity */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{email}</div>
              </div>

              {/* Navigation */}
              <a
                href="/en/admin"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Dashboard
              </a>

              <a
                href="/"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                View main site
              </a>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <a
                  href="/api/auth/signout?callbackUrl=/en/admin"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
