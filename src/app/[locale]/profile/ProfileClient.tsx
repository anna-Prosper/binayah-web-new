"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";
import { LogOut, Home, User, Building2, Bell, CheckCircle2, Clock, Phone } from "lucide-react";
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

function getStatusConfig(status?: string) {
  const normalized = status === "new" || !status ? "under_review" : status;
  if (normalized === "contacted") return {
    label: "Agent Contacted",
    borderColor: "border-l-blue-500",
    pillBg: "bg-blue-500/10",
    pillText: "text-blue-500",
    Icon: Phone,
  };
  if (normalized === "listed") return {
    label: "Listed",
    borderColor: "border-l-emerald-500",
    pillBg: "bg-emerald-500/10",
    pillText: "text-emerald-600",
    Icon: CheckCircle2,
  };
  return {
    label: "Under Review",
    borderColor: "border-l-amber-400",
    pillBg: "bg-amber-500/10",
    pillText: "text-amber-500",
    Icon: Clock,
  };
}

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

  const { ids: favIds } = useFavorites();
  const { subscribedSlugs, loading: subsLoading } = useProjectSubscriptions();

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
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden pt-24 sm:pt-28"
        style={{ background: "linear-gradient(135deg, #061a11 0%, #0B3D2E 35%, #0e4f37 65%, #145C3F 100%)" }}
      >
        {/* Diagonal luxury stripe */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 72px)",
          }}
        />
        {/* Radial depth glow */}
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(26,122,90,0.22) 0%, transparent 65%)" }}
        />

        {/* Sign out */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/60 hover:text-white/90 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-10 relative">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left gap-6 sm:gap-8">
            {/* Avatar with gold ring */}
            <div className="flex-shrink-0">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px]"
                style={{
                  background: "linear-gradient(135deg, #D4A847 0%, #F0D080 50%, #B8922F 100%)",
                  boxShadow: "0 0 40px rgba(212,168,71,0.25)",
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#0B3D2E]">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      width={112}
                      height={112}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0e5038] flex items-center justify-center">
                      <User className="h-10 w-10 text-white/30" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name + email + stat chips */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-1 truncate">
                {user.name || "My Profile"}
              </h1>
              <p className="text-sm text-white/45 mb-5 sm:mb-6">{user.email}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                {[
                  { count: favIds.length, label: "Saved" },
                  { count: submissions.length, label: "Submissions" },
                  { count: subscribedSlugs.length, label: "Subscriptions" },
                ].map(({ count, label }) => (
                  <div
                    key={label}
                    className="flex items-baseline gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-black/20"
                  >
                    <span className="text-lg font-bold text-white leading-none">{count}</span>
                    <span className="text-xs text-white/45">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tab bar — underline indicator ── */}
      <div className="sticky top-0 z-30 bg-background border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex overflow-x-auto scrollbar-none -mb-px">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`relative whitespace-nowrap px-5 py-4 text-sm font-semibold transition-colors flex-shrink-0 border-b-2 ${
                  activeTab === t.id
                    ? "text-foreground border-[#0B3D2E]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <section className="py-10 sm:py-14 min-h-[70vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">

          {/* ── Saved ── */}
          {activeTab === "saved" && <SavedPropertiesSection />}

          {/* ── Submissions ── */}
          {activeTab === "submissions" && (
            <div>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : loadError ? (
                <p className="text-sm text-red-600">{loadError}</p>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                    <Home className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No submissions yet</h3>
                  <p className="text-sm text-muted-foreground mb-7 max-w-xs leading-relaxed">
                    List your property and our agents will review and contact you within 24 hours.
                  </p>
                  <Link
                    href="/list-your-property"
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
                  >
                    List a Property
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((s) => {
                    const cfg = getStatusConfig(s.status);
                    const StatusIcon = cfg.Icon;
                    return (
                      <div
                        key={s._id}
                        className={`bg-card border border-border/50 border-l-4 ${cfg.borderColor} rounded-xl p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {s.propertyType || "Property"}
                            {s.community ? ` — ${s.community}` : ""}
                          </p>
                          {s.askingPrice ? (
                            <p className="text-xs font-bold mt-0.5" style={{ color: "#D4A847" }}>
                              AED {Number(s.askingPrice).toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">Price on request</p>
                          )}
                          {s.createdAt && (
                            <p className="text-[11px] text-muted-foreground mt-2">
                              Submitted{" "}
                              {new Date(s.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.pillBg} ${cfg.pillText}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Subscriptions ── */}
          {activeTab === "subscriptions" && (
            <div>
              {subsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : subscribedSlugs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                    <Bell className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No project subscriptions</h3>
                  <p className="text-sm text-muted-foreground mb-7 max-w-xs leading-relaxed">
                    Subscribe to off-plan projects to get notified about price changes, new floor plans, and milestones.
                  </p>
                  <Link
                    href="/off-plan"
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 15px rgba(212,168,71,0.3)" }}
                  >
                    Browse Off-Plan Projects
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {subscribedSlugs.length} project{subscribedSlugs.length !== 1 ? "s" : ""} subscribed
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscribedSlugs.map((slug) => (
                      <div
                        key={slug}
                        className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        {/* Gradient project header */}
                        <div
                          className="h-20 relative overflow-hidden flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)" }}
                        >
                          <Building2 className="h-10 w-10 text-white/8 absolute" />
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)",
                            }}
                          />
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/25">
                            Subscribed
                          </span>
                        </div>
                        {/* Body */}
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/project/${slug}`}
                              className="text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate"
                            >
                              {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">Off-plan project</p>
                          </div>
                          <Link
                            href={`/project/${slug}`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0 border border-border/70 rounded-lg px-2.5 py-1.5 hover:border-primary/50"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default function ProfileClient({ user }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileClientInner user={user} />
    </Suspense>
  );
}
