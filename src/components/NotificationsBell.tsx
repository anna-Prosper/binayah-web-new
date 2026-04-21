"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";

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

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  // ── Fetch / load notifications ─────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (isAuthed) {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
          return;
        }
      } catch {
        // fall through to localStorage
      }
    }
    // Anon or DB unreachable → localStorage
    setItems(readLocalNotifs());
  }, [isAuthed]);

  useEffect(() => {
    if (status === "loading") return;
    loadNotifications();
  }, [status, loadNotifications]);

  // Listen for subscription events to refresh the bell
  useEffect(() => {
    const handler = () => loadNotifications();
    window.addEventListener("subscriptions-update", handler);
    return () => window.removeEventListener("subscriptions-update", handler);
  }, [loadNotifications]);

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

  // ── Mark as read ───────────────────────────────────────────────────────
  const markRead = useCallback(
    async (item: NotificationItem) => {
      // Optimistic local update
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );

      if (isAuthed) {
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [item.id] }),
        }).catch(() => {});
      } else {
        const updated = readLocalNotifs().map((n) =>
          n.id === item.id ? { ...n, read: true } : n
        );
        writeLocalNotifs(updated);
      }

      setOpen(false);
      router.push(`/project/${item.slug}`);
    },
    [isAuthed, router]
  );

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {/* Drawer / popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[200] w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
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
