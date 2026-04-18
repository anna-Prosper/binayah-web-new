"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Heart, Bell, User, Home } from "lucide-react";

interface Props {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
}

interface Submission {
  _id: string;
  propertyType?: string;
  community?: string;
  askingPrice?: number | null;
  status?: string;
  createdAt?: string;
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status === "new" || !status ? "under_review" : status;
  if (normalized === "under_review") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        Under Review
      </span>
    );
  }
  if (normalized === "contacted") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        Agent Contacted
      </span>
    );
  }
  if (normalized === "listed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Listed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      Under Review
    </span>
  );
}

export default function ProfileClient({ user }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/list-your-property")
      .then((r) => {
        if (!r.ok) throw new Error("non-ok response");
        return r.json();
      })
      .then((data) => {
        if (data.submissions) setSubmissions(data.submissions);
      })
      .catch(() => {
        setLoadError("Could not load submissions. Please refresh.");
      })
      .finally(() => setLoadingSubmissions(false));
  }, []);

  const openFavorites = () => {
    window.dispatchEvent(new Event("open-favorites-drawer"));
  };

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 40%, #1A7A5A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative flex items-center gap-6">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={80}
              height={80}
              className="rounded-full border-4 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-white/70" />
            </div>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{user.name || "My Profile"}</h1>
            <p className="text-primary-foreground/70 mt-1">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

          {/* Quick actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={openFavorites}
              className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/20 hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">My Favorites</p>
                <p className="text-sm text-muted-foreground">View saved properties</p>
              </div>
            </button>

            <Link
              href="/list-your-property"
              className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">List a Property</p>
                <p className="text-sm text-muted-foreground">Sell or rent your property</p>
              </div>
            </Link>

            <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-3 opacity-60">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Price Alerts</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>

          {/* My Submissions */}
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">My Submissions</h2>
            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : loadError ? (
              <p className="text-sm text-red-600">{loadError}</p>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions yet.{" "}
                <Link href="/list-your-property" className="underline hover:text-foreground">
                  List your property
                </Link>{" "}
                to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {submissions.map((s) => (
                  <div
                    key={s._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border/40 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {s.propertyType || "Property"}
                        {s.community ? ` — ${s.community}` : ""}
                      </p>
                      {s.askingPrice ? (
                        <p className="text-xs text-muted-foreground">
                          AED {Number(s.askingPrice).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={s.status} />
                      {s.createdAt && (
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign out */}
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Account</h2>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
