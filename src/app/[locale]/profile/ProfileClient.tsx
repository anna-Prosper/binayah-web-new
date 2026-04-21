"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LogOut, Home, User, Building2, Bell,
  CheckCircle2, Clock, Phone, Pencil, MapPin, X, Save,
  Mail, MessageCircle, Send, Trash2, Edit3, Check,
} from "lucide-react";
import { useFavorites } from "@/components/PropertyActions";
import { useProjectSubscriptions } from "@/hooks/useProjectSubscriptions";
import SavedPropertiesSection from "@/components/SavedPropertiesSection";
import { apiUrl } from "@/lib/api";

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

interface NotifPrefs {
  email: boolean;
  whatsapp: boolean;
  telegram: boolean;
}

interface ProfileExtra {
  phone?: string;
  location?: string;
  displayName?: string;
  notifPrefs?: Record<string, Partial<NotifPrefs>>;
}

type Tab = "saved" | "submissions" | "subscriptions";

const PROPERTY_TYPES = ["Apartment","Villa","Townhouse","Penthouse","Studio","Duplex","Office","Retail","Warehouse","Plot","Other"];

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
  if (normalized === "cancelled") return {
    label: "Cancelled",
    borderColor: "border-l-gray-300",
    pillBg: "bg-gray-100",
    pillText: "text-gray-500",
    Icon: X,
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

  // Profile editing
  const [profileExtra, setProfileExtra] = useState<ProfileExtra>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Subscription actions
  const [unsubscribeConfirm, setUnsubscribeConfirm] = useState<string | null>(null);
  const [unsubscribing, setUnsubscribing] = useState(false);

  // Submission actions
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [editSubForm, setEditSubForm] = useState({ propertyType: "", community: "", askingPrice: "" });
  const [savingSub, setSavingSub] = useState(false);

  const { ids: favIds } = useFavorites();
  const { subscribedSlugs, loading: subsLoading, refresh: refreshSubs } = useProjectSubscriptions();

  // Fetch profile extras
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: ProfileExtra) => {
        setProfileExtra(data);
        setEditForm({
          name: data.displayName || user.name || "",
          phone: data.phone || "",
          location: data.location || "",
        });
      })
      .catch(() => {});
  }, [user.name]);

  // Fetch project details for subscription cards
  const { data: subscriptionProjects } = useQuery({
    queryKey: ["subscription-projects", subscribedSlugs],
    queryFn: async () => {
      const results = await Promise.allSettled(
        subscribedSlugs.map((slug) =>
          fetch(apiUrl(`/api/projects/${slug}`)).then((r) => (r.ok ? r.json() : null))
        )
      );
      const map: Record<string, Record<string, unknown>> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) map[subscribedSlugs[i]] = r.value;
      });
      return map;
    },
    enabled: subscribedSlugs.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Load submissions
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
      .catch(() => setLoadError("Could not load submissions. Please refresh."))
      .finally(() => setLoadingSubmissions(false));
  }, [activeTab, submissions.length, loadingSubmissions]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  // ── Profile edit ──────────────────────────────────────────────────────────
  const openEdit = () => {
    setEditForm({
      name: profileExtra.displayName || user.name || "",
      phone: profileExtra.phone || "",
      location: profileExtra.location || "",
    });
    setSaveError(null);
    setIsEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editForm.name.trim() || undefined,
          phone: editForm.phone.trim() || undefined,
          location: editForm.location.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Save failed");
      }
      setProfileExtra((prev) => ({
        ...prev,
        displayName: editForm.name.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        location: editForm.location.trim() || undefined,
      }));
      setIsEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Notification prefs ────────────────────────────────────────────────────
  const getNotifPrefs = (slug: string): NotifPrefs => {
    const p = profileExtra.notifPrefs?.[slug];
    return { email: p?.email ?? true, whatsapp: p?.whatsapp ?? true, telegram: p?.telegram ?? true };
  };

  const toggleNotif = async (slug: string, channel: keyof NotifPrefs) => {
    const current = getNotifPrefs(slug);
    const updated = { ...current, [channel]: !current[channel] };
    setProfileExtra((prev) => ({
      ...prev,
      notifPrefs: { ...prev.notifPrefs, [slug]: updated },
    }));
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifPrefs: { [slug]: updated } }),
    }).catch(() => {});
  };

  // ── Unsubscribe ───────────────────────────────────────────────────────────
  const doUnsubscribe = async (slug: string) => {
    setUnsubscribing(true);
    try {
      await fetch("/api/project-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      window.dispatchEvent(new CustomEvent("subscriptions-update"));
      refreshSubs();
    } finally {
      setUnsubscribeConfirm(null);
      setUnsubscribing(false);
    }
  };

  // ── Submission cancel/edit ────────────────────────────────────────────────
  const doCancel = async (id: string) => {
    setCancelling(true);
    try {
      const res = await fetch("/api/list-your-property", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "cancel" }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: "cancelled" } : s))
        );
      }
    } finally {
      setCancelConfirm(null);
      setCancelling(false);
    }
  };

  const openEditSub = (s: Submission) => {
    setEditSubId(s._id);
    setEditSubForm({
      propertyType: s.propertyType || "",
      community: s.community || "",
      askingPrice: s.askingPrice ? String(s.askingPrice) : "",
    });
  };

  const saveEditSub = async () => {
    if (!editSubId) return;
    setSavingSub(true);
    try {
      const res = await fetch("/api/list-your-property", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editSubId,
          action: "edit",
          propertyType: editSubForm.propertyType || undefined,
          community: editSubForm.community || undefined,
          askingPrice: editSubForm.askingPrice ? Number(editSubForm.askingPrice) : null,
        }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s._id === editSubId
              ? {
                  ...s,
                  propertyType: editSubForm.propertyType || s.propertyType,
                  community: editSubForm.community || s.community,
                  askingPrice: editSubForm.askingPrice ? Number(editSubForm.askingPrice) : s.askingPrice,
                }
              : s
          )
        );
        setEditSubId(null);
      }
    } finally {
      setSavingSub(false);
    }
  };

  const displayedName = profileExtra.displayName || user.name || "My Profile";
  const canEditSub = (status?: string) => status === "under_review" || status === "new";

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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 72px)",
          }}
        />
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(26,122,90,0.22) 0%, transparent 65%)" }}
        />

        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10 flex items-center gap-2">
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/60 hover:text-white/90 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/60 hover:text-white/90 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-10 relative">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left gap-6 sm:gap-8">
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
                    <Image src={user.image} alt="" width={112} height={112} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#0e5038] flex items-center justify-center">
                      <User className="h-10 w-10 text-white/30" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-1 truncate">
                {displayedName}
              </h1>
              <p className="text-sm text-white/45 mb-3">{user.email}</p>

              {(profileExtra.phone || profileExtra.location) ? (
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  {profileExtra.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-white/55">
                      <Phone className="h-3 w-3" />{profileExtra.phone}
                    </span>
                  )}
                  {profileExtra.location && (
                    <span className="flex items-center gap-1.5 text-xs text-white/55">
                      <MapPin className="h-3 w-3" />{profileExtra.location}
                    </span>
                  )}
                </div>
              ) : (
                <button onClick={openEdit} className="text-xs text-white/30 hover:text-white/55 transition-colors">
                  + Add phone &amp; location
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Edit profile panel ── */}
      {isEditing && (
        <div className="bg-card border-b border-border shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "name", label: "Display name", type: "text", placeholder: user.name || "Your name", maxLength: 80 },
                { key: "phone", label: "Phone number", type: "tel", placeholder: "+971 50 000 0000", maxLength: 20 },
                { key: "location", label: "Location", type: "text", placeholder: "Dubai, UAE", maxLength: 100 },
              ].map(({ key, label, type, placeholder, maxLength }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              ))}
            </div>
            {saveError && <p className="text-xs text-red-500 mt-3">{saveError}</p>}
            <div className="flex items-center justify-end gap-3 mt-5">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-all hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(to right, #0B3D2E, #145C3F)" }}
              >
                {saving ? <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
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
                    const isEditable = canEditSub(s.status);
                    const isEditingThis = editSubId === s._id;
                    const isCancellingThis = cancelConfirm === s._id;

                    return (
                      <div
                        key={s._id}
                        className={`bg-card border border-border/50 border-l-4 ${cfg.borderColor} rounded-xl overflow-hidden hover:shadow-md transition-shadow`}
                      >
                        <div className="p-5 flex items-start justify-between gap-4">
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
                              <p className="text-[11px] text-muted-foreground mt-1.5">
                                Submitted{" "}
                                {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            )}
                            {/* Actions row */}
                            {isEditable && !isEditingThis && (
                              <div className="flex items-center gap-3 mt-2.5">
                                {isCancellingThis ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Cancel submission?</span>
                                    <button
                                      onClick={() => doCancel(s._id)}
                                      disabled={cancelling}
                                      className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                    >
                                      {cancelling ? "…" : "Yes"}
                                    </button>
                                    <button onClick={() => setCancelConfirm(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => openEditSub(s)}
                                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                      Edit
                                    </button>
                                    <span className="text-muted-foreground/30">·</span>
                                    <button
                                      onClick={() => setCancelConfirm(s._id)}
                                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Cancel submission
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.pillBg} ${cfg.pillText}`}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </div>
                        </div>

                        {/* Inline edit form */}
                        {isEditingThis && (
                          <div className="border-t border-border/50 px-5 py-4 bg-muted/30">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Property type</label>
                                <select
                                  value={editSubForm.propertyType}
                                  onChange={(e) => setEditSubForm((f) => ({ ...f, propertyType: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                  <option value="">Unchanged</option>
                                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Community</label>
                                <input
                                  type="text"
                                  value={editSubForm.community}
                                  onChange={(e) => setEditSubForm((f) => ({ ...f, community: e.target.value }))}
                                  placeholder={s.community || "e.g. Downtown Dubai"}
                                  maxLength={200}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Asking price (AED)</label>
                                <input
                                  type="number"
                                  value={editSubForm.askingPrice}
                                  onChange={(e) => setEditSubForm((f) => ({ ...f, askingPrice: e.target.value }))}
                                  placeholder={s.askingPrice ? String(s.askingPrice) : "e.g. 1500000"}
                                  min={0}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={saveEditSub}
                                disabled={savingSub}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-60"
                                style={{ background: "linear-gradient(to right, #0B3D2E, #145C3F)" }}
                              >
                                {savingSub ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="h-3 w-3" />}
                                {savingSub ? "Saving…" : "Save"}
                              </button>
                              <button onClick={() => setEditSubId(null)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
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
                    {subscribedSlugs.map((slug) => {
                      const project = subscriptionProjects?.[slug];
                      const projectImage =
                        (project?.imageGallery as string[] | undefined)?.[0] ||
                        (project?.coverImage as string | undefined) ||
                        (project?.featuredImage as string | undefined);
                      const projectName =
                        (project?.name as string | undefined) ||
                        (project?.title as string | undefined) ||
                        slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      const developerName = project?.developerName as string | undefined;
                      const prefs = getNotifPrefs(slug);
                      const isConfirming = unsubscribeConfirm === slug;

                      return (
                        <div
                          key={slug}
                          className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                          {/* Project image — clicking goes to project */}
                          <Link href={`/project/${slug}`} className="block relative h-44 overflow-hidden">
                            {projectImage ? (
                              <>
                                <Image src={projectImage} alt={projectName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                              </>
                            ) : (
                              <div className="w-full h-full relative flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)" }}>
                                <Building2 className="h-12 w-12 text-white/10" />
                                <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)" }} />
                              </div>
                            )}
                            {/* Name + developer over image */}
                            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
                              <p className="text-sm font-bold text-white leading-snug truncate drop-shadow-sm">{projectName}</p>
                              {developerName && <p className="text-[11px] text-white/60 mt-0.5 truncate">{developerName}</p>}
                            </div>
                            <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
                              Subscribed
                            </span>
                          </Link>

                          {/* Notification toggles */}
                          <div className="px-4 pt-3.5 pb-3">
                            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Notify via</p>
                            <div className="flex gap-2">
                              {([
                                { key: "email" as const, label: "Email", Icon: Mail },
                                { key: "whatsapp" as const, label: "WhatsApp", Icon: MessageCircle },
                                { key: "telegram" as const, label: "Telegram", Icon: Send },
                              ] as const).map(({ key, label, Icon }) => {
                                const on = prefs[key];
                                return (
                                  <button
                                    key={key}
                                    onClick={() => toggleNotif(slug, key)}
                                    title={on ? `Disable ${label}` : `Enable ${label}`}
                                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-medium transition-all flex-1 justify-center border ${
                                      on
                                        ? "bg-[#0B3D2E] text-white border-[#0B3D2E] shadow-sm"
                                        : "bg-background text-muted-foreground/60 border-border/60 hover:border-border"
                                    }`}
                                  >
                                    {on
                                      ? <Check className="h-3 w-3 flex-shrink-0" />
                                      : <Icon className="h-3 w-3 flex-shrink-0 opacity-50" />
                                    }
                                    <span className="truncate">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 py-2.5 border-t border-border/40 flex items-center justify-between">
                            <Link href={`/project/${slug}`} className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                              View project →
                            </Link>
                            {isConfirming ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Sure?</span>
                                <button onClick={() => doUnsubscribe(slug)} disabled={unsubscribing} className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors">
                                  {unsubscribing ? "…" : "Yes"}
                                </button>
                                <button onClick={() => setUnsubscribeConfirm(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">No</button>
                              </div>
                            ) : (
                              <button onClick={() => setUnsubscribeConfirm(slug)} className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-red-500 transition-colors">
                                <Trash2 className="h-3 w-3" />
                                Unsubscribe
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
