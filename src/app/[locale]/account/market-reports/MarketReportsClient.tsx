"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, X, Check, AlertTriangle, CheckCircle2 } from "lucide-react";
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

function formatList(items: string[] | undefined, maxVisible = 2): string {
  if (!items || items.length === 0) return "";
  if (items.length <= maxVisible) return items.join(", ");
  return `${items.slice(0, maxVisible).join(", ")} +${items.length - maxVisible} more`;
}

// ── Chip (local, light-mode only) ─────────────────────────────────────────────

function EditChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all min-h-[32px] border ${
        selected
          ? "bg-[#D4A847]/10 border-[#D4A847] text-[#0B3D2E]"
          : "bg-background border-border text-muted-foreground hover:border-[#D4A847] hover:text-foreground"
      }`}
    >
      {selected && <Check className="h-3 w-3 flex-shrink-0" />}
      {label}
    </button>
  );
}

// ── Budget display helper ──────────────────────────────────────────────────────

const BUDGET_MAX = 20_000_000;
const BUDGET_STEP = 100_000;

function BudgetEditRow({
  min,
  max,
  onChange,
}: {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  const t = useTranslations("weeklyReport");
  const currentMin = min ?? 0;
  const currentMax = max ?? BUDGET_MAX;
  const isDefault = min === null && max === null;
  const minPct = (currentMin / BUDGET_MAX) * 100;
  const maxPct = (currentMax / BUDGET_MAX) * 100;
  const GOLD = "#D4A847";
  const TRACK_DEFAULT = "hsl(40,15%,88%)";

  function fmtBudget(v: number) {
    if (v >= 1_000_000) return `AED ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `AED ${Math.round(v / 1_000)}K`;
    return `AED ${v.toLocaleString()}`;
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono tabular-nums text-foreground">
          {isDefault ? t("anyBudget") : `${fmtBudget(currentMin)} — ${fmtBudget(currentMax)}`}
        </span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-xs underline text-muted-foreground"
          >
            {t("anyBudget")}
          </button>
        )}
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ background: TRACK_DEFAULT }} />
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            left: `${minPct}%`,
            right: `${100 - maxPct}%`,
            background: isDefault ? TRACK_DEFAULT : GOLD,
          }}
        />
        <input
          type="range" min={0} max={BUDGET_MAX} step={BUDGET_STEP} value={currentMin}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            const nm = val >= currentMax ? currentMax - BUDGET_STEP : val;
            onChange(nm === 0 && currentMax === BUDGET_MAX ? null : nm, max);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A847] [&::-webkit-slider-thumb]:shadow-sm"
          style={{ zIndex: currentMin > BUDGET_MAX - BUDGET_STEP ? 5 : 3 }}
        />
        <input
          type="range" min={0} max={BUDGET_MAX} step={BUDGET_STEP} value={currentMax}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            const nm = val <= currentMin ? currentMin + BUDGET_STEP : val;
            onChange(min, nm === BUDGET_MAX && currentMin === 0 ? null : nm);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A847] [&::-webkit-slider-thumb]:shadow-sm"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}

// ── Editable row ──────────────────────────────────────────────────────────────

type RowKey = "areas" | "propertyTypes" | "budget" | "intents";

interface EditableRowProps {
  rowKey: RowKey;
  label: string;
  currentValue: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  saving: boolean;
}

function EditableRow({
  label,
  currentValue,
  isEditing,
  onEdit,
  onCancel,
  children,
  onSave,
  saving,
}: EditableRowProps) {
  const t = useTranslations("weeklyReport");
  return (
    <div className="border-b border-border/50 last:border-0">
      {!isEditing ? (
        <div className="flex items-center justify-between py-3">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              {label}
            </span>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {currentValue || <span className="text-muted-foreground">{t("account.notSet")}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 ml-4"
          >
            <Pencil className="h-3 w-3" />
            {t("account.editButton")}
          </button>
        </div>
      ) : (
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#D4A847]">
              {label}
            </span>
            <button
              type="button"
              onClick={onCancel}
              className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {children}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              {t("account.cancelButton")}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              {saving ? (
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              {t("account.saveButton")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MarketReportsClient({ initialSubscription, userEmail }: Props) {
  const t = useTranslations("weeklyReport");
  const [sub, setSub] = useState<SubscriptionData | null>(initialSubscription);
  const [activeRow, setActiveRow] = useState<RowKey | null>(null);
  const [showUnsubModal, setShowUnsubModal] = useState(false);
  const [unsubLoading, setUnsubLoading] = useState(false);
  const [unsubDone, setUnsubDone] = useState(false);
  const [saving, setSaving] = useState(false);

  // Draft state for each row — only written to sub on Save
  const [draftAreas, setDraftAreas] = useState<string[]>([]);
  const [draftPropertyTypes, setDraftPropertyTypes] = useState<string[]>([]);
  const [draftIntents, setDraftIntents] = useState<string[]>([]);
  const [draftBudgetMin, setDraftBudgetMin] = useState<number | null>(null);
  const [draftBudgetMax, setDraftBudgetMax] = useState<number | null>(null);

  const INTENT_OPTIONS = ["buy", "rent", "sell", "invest"] as const;
  const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse"] as const;

  function openRow(key: RowKey) {
    // Seed drafts from current sub
    if (key === "areas") setDraftAreas(sub?.areas || []);
    if (key === "propertyTypes") setDraftPropertyTypes(sub?.propertyTypes || []);
    if (key === "intents") setDraftIntents(sub?.intents || []);
    if (key === "budget") {
      setDraftBudgetMin(sub?.budgetMin ?? null);
      setDraftBudgetMax(sub?.budgetMax ?? null);
    }
    setActiveRow(key);
  }

  function closeRow() {
    setActiveRow(null);
  }

  function toggleChip<T extends string>(list: T[], val: T): T[] {
    return list.includes(val) ? list.filter((v) => v !== val) : [...list, val];
  }

  async function saveRow(key: RowKey) {
    if (!sub) return;
    setSaving(true);
    const patch: Partial<SubscriptionData> = {};
    if (key === "areas") patch.areas = draftAreas;
    if (key === "propertyTypes") patch.propertyTypes = draftPropertyTypes;
    if (key === "intents") patch.intents = draftIntents;
    if (key === "budget") {
      patch.budgetMin = draftBudgetMin ?? undefined;
      patch.budgetMax = draftBudgetMax ?? undefined;
    }

    try {
      const res = await fetch(apiUrl(`/api/market-report/update/${sub._id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setSub((prev) => (prev ? { ...prev, ...patch } : prev));
        setActiveRow(null);
      }
    } catch {
      // silent — stay in editing mode
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsub() {
    if (!sub?.unsubToken) return;
    setUnsubLoading(true);
    try {
      await fetch(apiUrl(`/api/market-report/unsubscribe/${sub.unsubToken}`));
      setSub(null);
      setUnsubDone(true);
    } catch {
      // silent
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
  const confirmedDate = sub.confirmedAt
    ? new Date(sub.confirmedAt).toLocaleDateString("en-AE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${
          isConfirmed
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}
      >
        {isConfirmed ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {t("account.statusActive")}
            {confirmedDate && (
              <span className="ml-auto text-xs font-normal opacity-70">
                {t("account.confirmedSince", { date: confirmedDate })}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {t("account.statusPending")}
          </>
        )}
      </div>

      {/* Subscription preferences — 4 independent editable rows */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(to right, #D4A847, #B8922F)" }}
        />
        <div className="px-8 py-2">
          {/* Areas row */}
          <EditableRow
            rowKey="areas"
            label={t("account.fields.areas")}
            currentValue={formatList(sub.areas)}
            isEditing={activeRow === "areas"}
            onEdit={() => openRow("areas")}
            onCancel={closeRow}
            onSave={() => saveRow("areas")}
            saving={saving}
          >
            <div className="flex flex-wrap gap-2">
              {/* Areas edit: simple text chips from current selection */}
              {(sub.areas || []).map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-[#D4A847]/10 border-[#D4A847] text-[#0B3D2E]"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() =>
                      setDraftAreas((prev) => prev.filter((a) => a !== area))
                    }
                    className="ml-0.5 hover:opacity-70 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {draftAreas
                .filter((a) => !(sub.areas || []).includes(a))
                .map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-[#D4A847]/10 border-[#D4A847] text-[#0B3D2E]"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() =>
                        setDraftAreas((prev) => prev.filter((a) => a !== area))
                      }
                      className="ml-0.5 hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("account.areasEditHint")}
            </p>
          </EditableRow>

          {/* Property types row */}
          <EditableRow
            rowKey="propertyTypes"
            label={t("account.fields.propertyTypes")}
            currentValue={formatList(sub.propertyTypes)}
            isEditing={activeRow === "propertyTypes"}
            onEdit={() => openRow("propertyTypes")}
            onCancel={closeRow}
            onSave={() => saveRow("propertyTypes")}
            saving={saving}
          >
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt) => (
                <EditChip
                  key={pt}
                  label={t(`form.propertyTypes.${pt}`)}
                  selected={draftPropertyTypes.includes(pt)}
                  onToggle={() => setDraftPropertyTypes((prev) => toggleChip(prev, pt))}
                />
              ))}
            </div>
          </EditableRow>

          {/* Budget row */}
          <EditableRow
            rowKey="budget"
            label={t("account.fields.budget")}
            currentValue={formatBudget(sub.budgetMin, sub.budgetMax)}
            isEditing={activeRow === "budget"}
            onEdit={() => openRow("budget")}
            onCancel={closeRow}
            onSave={() => saveRow("budget")}
            saving={saving}
          >
            <BudgetEditRow
              min={draftBudgetMin}
              max={draftBudgetMax}
              onChange={(min, max) => {
                setDraftBudgetMin(min);
                setDraftBudgetMax(max);
              }}
            />
          </EditableRow>

          {/* Intents row */}
          <EditableRow
            rowKey="intents"
            label={t("account.fields.intents")}
            currentValue={formatList(sub.intents?.map((i) => i.charAt(0).toUpperCase() + i.slice(1)))}
            isEditing={activeRow === "intents"}
            onEdit={() => openRow("intents")}
            onCancel={closeRow}
            onSave={() => saveRow("intents")}
            saving={saving}
          >
            <div className="flex flex-wrap gap-2">
              {INTENT_OPTIONS.map((intent) => (
                <EditChip
                  key={intent}
                  label={t(`form.intents.${intent}`)}
                  selected={draftIntents.includes(intent)}
                  onToggle={() => setDraftIntents((prev) => toggleChip(prev, intent))}
                />
              ))}
            </div>
          </EditableRow>
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
