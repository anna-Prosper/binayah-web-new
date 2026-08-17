"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Locale-aware router: next/navigation's router.push takes a bare path, which
// localePrefix "as-needed" resolves to the DEFAULT locale, kicking non-English
// users into English mid-flow. This variant keeps them in their locale.
import { useRouter } from "@/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useHoneypot } from "@/components/Honeypot";

const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail", "Warehouse", "Land"];
const LISTING_TYPES = ["Sale", "Rent"];

export default function ListPropertyForm() {
  const t = useTranslations("listProperty");
  const { data: session } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { value: hp, field: honeypotField } = useHoneypot();

  const [form, setForm] = useState({
    name: "",
    email: "",
    propertyType: "",
    listingType: "Sale",
    community: "",
    bedrooms: "",
    areaSqft: "",
    askingPrice: "",
    description: "",
    phone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Prefill contact details from the session when signed in (still editable).
  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || session.user?.name || "",
        email: f.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/list-your-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hp }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t("errors.genericError"));
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{t("success.title")}</h2>
        <p className="text-muted-foreground max-w-sm">{t("success.desc")}</p>
        {!session?.user && (
          <div className="mt-2 w-full max-w-sm rounded-xl border border-primary/15 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground mb-3">{t("success.accountPrompt")}</p>
            <button
              onClick={() => router.push(`/signin?email=${encodeURIComponent(form.email)}`)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              {t("success.createAccount")}
            </button>
          </div>
        )}
        <button
          onClick={() => router.push("/")}
          className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition-colors"
        >
          {t("success.backHome")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {honeypotField}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.name")}</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder={t("form.namePlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.email")}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            placeholder={t("form.emailPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.propertyType")}</label>
          <select
            value={form.propertyType}
            onChange={(e) => set("propertyType", e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">{t("form.selectType")}</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.listingType")}</label>
          <div className="flex gap-2">
            {LISTING_TYPES.map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => set("listingType", lt)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  form.listingType === lt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                {lt === "Sale" ? t("form.sale") : t("form.rent")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.community")}</label>
        <input
          type="text"
          value={form.community}
          onChange={(e) => set("community", e.target.value)}
          required
          placeholder={t("form.communityPlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.bedrooms")}</label>
          <input
            type="number"
            min="0"
            value={form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
            placeholder={t("form.bedroomsPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.area")}</label>
          <input
            type="number"
            min="0"
            value={form.areaSqft}
            onChange={(e) => set("areaSqft", e.target.value)}
            placeholder={t("form.areaPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.askingPrice")}</label>
          <input
            type="number"
            min="0"
            value={form.askingPrice}
            onChange={(e) => set("askingPrice", e.target.value)}
            placeholder={t("form.pricePlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.description")}</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder={t("form.descriptionPlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("form.phone")}</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          required
          placeholder={t("form.phonePlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground mt-1">{t("heroSubtitle")}</p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("submitting")}</> : t("submit")}
      </button>
    </form>
  );
}
