"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, X, Check, AlertTriangle } from "lucide-react";
import WeeklySubscribeForm from "@/components/WeeklySubscribeForm";
import { apiUrl } from "@/lib/api";

export interface SubscriptionData {
  _id?: string;
  email: string;
  name?: string;
  areas?: string[];
  propertyTypes?: string[];
  intents?: string[];
  budgetMin?: number;
  budgetMax?: number;
  confirmedAt?: string;
  unsubscribedAt?: string;
  unsubToken?: string;
  createdAt?: string;
}

interface Props {
  initialSubscription: SubscriptionData | null;
  userEmail: string;
}

function SubscriptionRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const t = useTranslations("weeklyReport");
  return (
    <div className="flex items-start justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
        {value || t("account.notSet")}
      </span>
    </div>
  );
}

function formatBudget(min?: number, max?: number): string {
  if (!min && !max) return "";
  function fmt(n: number) {
    if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`;
    return `AED ${n.toLocaleString()}`;
  }
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `up to ${fmt(max)}`;
  return "";
}

export default function MarketReportsClient({ initialSubscription, userEmail }: Props) {
  const t = useTranslations("weeklyReport");
  const [sub, setSub] = useState<SubscriptionData | null>(initialSubscription);
  const [editing, setEditing] = useState(false);
  const [showUnsubModal, setShowUnsubModal] = useState(false);
  const [unsubLoading, setUnsubLoading] = useState(false);
  const [unsubDone, setUnsubDone] = useState(false);

  async function handleUnsub() {
    if (!sub?.unsubToken) return;
    setUnsubLoading(true);
    try {
      await fetch(apiUrl(`/api/market-report/unsubscribe/${sub.unsubToken}`));
      setSub(null);
      setUnsubDone(true);
    } catch {
      // silent — user can retry
    } finally {
      setUnsubLoading(false);
      setShowUnsubModal(false);
    }
  }

  // No subscription — show inline form
  if (!sub || unsubDone) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
        />
        <div className="p-8">
          <WeeklySubscribeForm
            source="account-market-reports"
            variant="light"
            defaultAreas={[]}
          />
        </div>
      </div>
    );
  }

  const isConfirmed = !!sub.confirmedAt;

  if (editing) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
        />
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-accent">
              {t("account.editLabel")}
            </p>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <WeeklySubscribeForm
            source="account-market-reports-edit"
            variant="light"
            defaultAreas={sub.areas || []}
            defaultPropertyTypes={sub.propertyTypes || []}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active subscription summary */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
        />
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isConfirmed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                    <Check className="h-2.5 w-2.5" />
                    {t("account.statusActive")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {t("account.statusPending")}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-foreground">{t("account.dispatchLabel")}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("account.editButton")}
            </button>
          </div>

          <div className="space-y-0">
            <SubscriptionRow
              label={t("account.fields.email")}
              value={sub.email}
            />
            <SubscriptionRow
              label={t("account.fields.areas")}
              value={sub.areas?.join(", ")}
            />
            <SubscriptionRow
              label={t("account.fields.propertyTypes")}
              value={sub.propertyTypes?.join(", ")}
            />
            <SubscriptionRow
              label={t("account.fields.intents")}
              value={sub.intents?.join(", ")}
            />
            <SubscriptionRow
              label={t("account.fields.budget")}
              value={formatBudget(sub.budgetMin, sub.budgetMax)}
            />
            <SubscriptionRow
              label={t("account.fields.since")}
              value={
                sub.confirmedAt
                  ? new Date(sub.confirmedAt).toLocaleDateString("en-AE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : null
              }
            />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="text-sm font-semibold text-destructive mb-1">
          {t("account.dangerHeading")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t("account.dangerBody")}</p>
        <button
          type="button"
          onClick={() => setShowUnsubModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-destructive border border-destructive/50 hover:bg-destructive/10 transition-colors"
        >
          {t("account.unsubButton")}
        </button>
      </div>

      {/* Unsubscribe modal */}
      {showUnsubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border/50 p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("account.unsubModalHeading")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("account.unsubModalBody")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowUnsubModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                {t("account.cancelButton")}
              </button>
              <button
                type="button"
                onClick={handleUnsub}
                disabled={unsubLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-60"
              >
                {unsubLoading ? t("account.unsubLoading") : t("account.unsubConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
