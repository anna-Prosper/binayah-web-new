"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

const LOCAL_NOTIF_KEY = "binayah_notifications";

interface NotificationItem {
  id: string;
  slug: string;
  projectName: string;
  projectImage: string | null;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string | Date;
}

function readLocalNotifs(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalNotifs(items: NotificationItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(items));
}

function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationsBell() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.id;
  const router = useRouter();
  const { toast } = useToast();
  const { subscribedSlugs } = useProjectSubscriptions();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("notificationsBell");

  // Area 3: syncedForUser ref — prevents re-fetch on tab focus
  const syncedForUser = useRef<string | null>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  // ── Fetch / load notifications ─────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (status === "loading") return;

    // Area 3: short-circuit if already synced for this user/session
    const currentKey = isAuthed ? session!.user!.id! : "__anon__";
    if (syncedForUser.current === currentKey) return;

    if (isAuthed) {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
          // Mark synced only on success
          syncedForUser.current = currentKey;
          return;
        }
      } catch {
        // fall through to localStorage — do NOT set syncedForUser so we retry next time
      }
    }
    // Anon or DB unreachable → localStorage
    setItems(readLocalNotifs());
    syncedForUser.current = currentKey;
  }, [isAuthed, status, session]);

  // Initial load + session changes
  useEffect(() => {
    if (status === "loading") return;
    loadNotifications();
  }, [status, loadNotifications]);

  // Area 3: force-refresh when subscribedSlugs change (new subscription created)
  const forceLoad = useCallback(async () => {
    syncedForUser.current = null; // invalidate cache
    await loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (status === "loading") return;
    // Only force-refresh on subsequent changes (not on initial mount — initial load covers it)
    if (syncedForUser.current !== null) forceLoad();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribedSlugs, status, forceLoad]);

  // Close drawer on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  // Mark all unread as read when drawer opens (clears the badge)
  useEffect(() => {
    if (!open) return;
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));

    if (isAuthed) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      }).catch(() => {});
    } else {
      const updated = readLocalNotifs().map((n) =>
        unreadIds.includes(n.id) ? { ...n, read: true } : n
      );
      writeLocalNotifs(updated);
    }
  }, [open, items, isAuthed]);

  // ── Mark as read (Area 2: rollback + toast on failure) ─────────────────
  const markRead = useCallback(
    async (item: NotificationItem) => {
      // Capture prev state before optimistic update
      const prev = items;

      // Optimistic local update
      setItems((p) =>
        p.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );

      if (isAuthed) {
        try {
          const res = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [item.id] }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          // Navigate only on success
          setOpen(false);
          router.push(`/project/${item.slug}`);
        } catch {
          // Revert and toast — do NOT navigate
          setItems(prev);
          toast({ title: t("cantMarkRead"), description: t("tryAgain"), variant: "destructive" });
        }
      } else {
        // Anon — localStorage write (rare failure)
        const updated = readLocalNotifs().map((n) =>
          n.id === item.id ? { ...n, read: true } : n
        );
        writeLocalNotifs(updated);
        setOpen(false);
        router.push(`/project/${item.slug}`);
      }
    },
    [isAuthed, router, items, toast]
  );

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={unreadCount > 0 ? t("ariaLabelUnread", { count: unreadCount }) : t("ariaLabel")}
        className="relative w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Drawer / popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[200] w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{t("title")}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("empty")}
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => markRead(item)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-b-0 ${
                    item.read ? "opacity-60" : ""
                  }`}
                >
                  {/* Project thumbnail or default icon */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                    {item.projectImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.projectImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bell className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {item.body ?? `Updates for ${item.projectName}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>

                  {!item.read && (
                    <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-accent" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
