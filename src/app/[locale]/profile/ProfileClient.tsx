"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";
import { LogOut, Home, User, Building2, Bell } from "lucide-react";
import { useFavorites } from "@/components/PropertyActions";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";
import SavedPropertiesSection from "@/components/SavedPropertiesSection";

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

type Tab = "saved" | "submissions" | "subscriptions";

function StatusBadge({ status }: { status?: string }) {
  const normalized = status === "new" || !status ? "under_review" : status;
  if (normalized === "under_review") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800">
        Under Review
      </span>
    );
  }
  if (normalized === "contacted") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
        Agent Contacted
      </span>
    );
  }
  if (normalized === "listed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
        Listed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800">
      Under Review
    </span>
  );
}

// Inner component that reads search params (must be wrapped in Suspense)
function ProfileClientInner({ user }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    if (t === "submissions" || t === "subscriptions") return t;
    return "saved";
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  const { ids: favIds } = useFavorites();
  const { subscribedSlugs, loading: subsLoading } = useProjectSubscriptions();

  // Load submissions when tab becomes active
  useEffect(() => {
    if (activeTab !== "submissions") return;
    if (submissions.length > 0 || loadingSubmissions) return;
    setLoadingSubmissions(true);
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
  }, [activeTab, submissions.length, loadingSubmissions]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "saved", label: `Saved (${favIds.length})` },
    { id: "submissions", label: `Submissions (${submissions.length})` },
    { id: "subscriptions", label: `Subscriptions (${subscribedSlugs.length})` },
  ];

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B3D2E 0%, #145C3F 40%, #1A7A5A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }}
        />

        {/* Sign-out button — top right */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all border border-white/20 min-h-[44px] min-w-[44px]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          {/* Mobile: vertical stack. Desktop: horizontal. */}
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:gap-6">
            {/* Avatar */}
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={72}
                height={72}
                referrerPolicy="no-referrer"
                className="rounded-full border-4 border-white/20 flex-shrink-0 mb-3 sm:mb-0"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
                <User className="h-7 w-7 text-white/70" />
              </div>
            )}

            {/* Name + email + stat pills */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{user.name || "My Profile"}</h1>
              <p className="text-white/70 text-sm mt-0.5 mb-3">{user.email}</p>

              {/* Stat pills */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  onClick={() => switchTab("saved")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    activeTab === "saved"
                      ? "bg-white text-[#0B3D2E] border-white"
                      : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
                  }`}
                >
                  Saved {favIds.length}
                </button>
                <button
                  onClick={() => switchTab("submissions")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    activeTab === "submissions"
                      ? "bg-white text-[#0B3D2E] border-white"
                      : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
                  }`}
                >
                  Submissions {submissions.length}
                </button>
                <button
                  onClick={() => switchTab("subscriptions")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    activeTab === "subscriptions"
                      ? "bg-white text-[#0B3D2E] border-white"
                      : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
                  }`}
                >
                  Subscriptions {subscribedSlugs.length}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-30 bg-background border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                  activeTab === t.id
                    ? "bg-[#0B3D2E] text-white"
                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── Saved tab ── */}
          {activeTab === "saved" && (
            <SavedPropertiesSection />
          )}

          {/* ── Submissions tab ── */}
          {activeTab === "submissions" && (
            <div>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : loadError ? (
                <p className="text-sm text-red-600">{loadError}</p>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Home className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No submissions yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    List your property to get started — our agents will review and contact you.
                  </p>
                  <Link
                    href="/list-your-property"
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
                  >
                    List a Property
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {submissions.map((s) => (
                    <div
                      key={s._id}
                      className="bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {s.propertyType || "Property"}
                            {s.community ? ` — ${s.community}` : ""}
                          </p>
                          {s.askingPrice ? (
                            <p className="text-xs font-bold text-primary mt-0.5">
                              AED {Number(s.askingPrice).toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">Price on request</p>
                          )}
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        {s.createdAt ? (
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setTooltipId(tooltipId === s._id ? null : s._id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2.5 py-1"
                          >
                            View details
                          </button>
                          {tooltipId === s._id && (
                            <div className="absolute bottom-full right-0 mb-1.5 w-48 bg-card border border-border rounded-xl shadow-xl p-3 text-xs text-muted-foreground text-center z-10">
                              Details page coming soon
                              <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-card border-r border-b border-border" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Subscriptions tab ── */}
          {activeTab === "subscriptions" && (
            <div>
              {subsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : subscribedSlugs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No project subscriptions</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Subscribe to off-plan projects to get notified about price changes, new floor plans, and construction milestones.
                  </p>
                  <Link
                    href="/off-plan"
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
                  >
                    Browse Off-Plan Projects
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    You are subscribed to {subscribedSlugs.length} project{subscribedSlugs.length !== 1 ? "s" : ""}.
                  </p>
                  {subscribedSlugs.map((slug) => (
                    <div
                      key={slug}
                      className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/project/${slug}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </Link>
                          <p className="text-xs text-muted-foreground">Subscribed to updates</p>
                        </div>
                      </div>
                      <Link
                        href={`/project/${slug}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0 border border-border rounded-lg px-2.5 py-1"
                      >
                        View project
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

// Exported default wraps in Suspense for useSearchParams
export default function ProfileClient({ user }: Props) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileClientInner user={user} />
    </Suspense>
  );
}
