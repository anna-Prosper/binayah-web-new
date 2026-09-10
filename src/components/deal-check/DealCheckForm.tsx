"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link2, Upload, Type, X, Loader2, ArrowRight } from "lucide-react";

export type SubmitMode = "url" | "text" | "image";

export interface DealCheckSubmission {
  url?: string;
  text?: string;
  image?: string;
  mortgage: boolean;
  downPaymentPct: number | null;
}

interface Props {
  onSubmit: (s: DealCheckSubmission) => void;
  busy: boolean;
}

const MAX_IMAGE_MB = 6;

export default function DealCheckForm({ onSubmit, busy }: Props) {
  const t = useTranslations("dealCheck");
  const tabs: { id: SubmitMode; label: string; icon: typeof Link2 }[] = [
    { id: "url", label: t("tabLink"), icon: Link2 },
    { id: "image", label: t("tabUpload"), icon: Upload },
    { id: "text", label: t("tabText"), icon: Type },
  ];

  const [mode, setMode] = useState<SubmitMode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [mortgage, setMortgage] = useState(false);
  const [depositPct, setDepositPct] = useState(25);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError(t("errFileType"));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(t("errFileSize", { mb: MAX_IMAGE_MB }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
    };
    reader.onerror = () => setError(t("errFileRead"));
    reader.readAsDataURL(file);
  }, [t]);

  const submit = () => {
    setError(null);

    if (mode === "url") {
      const trimmed = url.trim();
      if (!trimmed) return setError(t("errNoLink"));
      if (!/^https?:\/\//i.test(trimmed)) {
        return setError(t("errBadLink"));
      }
      return onSubmit({ url: trimmed, mortgage, downPaymentPct: mortgage ? depositPct / 100 : null });
    }

    if (mode === "image") {
      if (!image) return setError(t("errNoFile"));
      return onSubmit({ image, mortgage, downPaymentPct: mortgage ? depositPct / 100 : null });
    }

    const trimmed = text.trim();
    if (trimmed.length < 25) {
      return setError(t("errShortText"));
    }
    return onSubmit({ text: trimmed, mortgage, downPaymentPct: mortgage ? depositPct / 100 : null });
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border/50" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              // The label is visually hidden on small screens to fit three
              // tabs, so name the control explicitly — otherwise the tab has
              // no accessible name at all on mobile.
              aria-label={tab.label}
              onClick={() => {
                setMode(tab.id);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium transition-colors ${
                active
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        {mode === "url" && (
          <div>
            <label htmlFor="dc-url" className="block text-sm font-medium text-foreground mb-2">
              {t("linkLabel")}
            </label>
            <input
              id="dc-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
              placeholder="https://..."
              className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("linkHint")}
            </p>
          </div>
        )}

        {mode === "image" && (
          <div>
            <span className="block text-sm font-medium text-foreground mb-2">
              {t("uploadLabel")}
            </span>
            {image ? (
              <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-background px-4 py-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 text-accent" aria-hidden />
                </div>
                <span className="text-sm text-foreground truncate flex-1">{imageName}</span>
                <button
                  onClick={() => {
                    setImage(null);
                    setImageName("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-muted-foreground hover:text-foreground p-1 rounded"
                  aria-label={t("uploadRemove")}
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                className="w-full rounded-xl border-2 border-dashed border-border/80 hover:border-accent/50 bg-background px-4 py-10 text-center transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-3" aria-hidden />
                <span className="block text-sm text-foreground font-medium">
                  {t("uploadCta")}
                </span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {t("uploadHint", { mb: MAX_IMAGE_MB })}
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}

        {mode === "text" && (
          <div>
            <label htmlFor="dc-text" className="block text-sm font-medium text-foreground mb-2">
              {t("textLabel")}
            </label>
            <textarea
              id="dc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={t("textPlaceholder")}
              className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all resize-y"
            />
          </div>
        )}

        {/* Financing — changes the cash figures materially, so we ask up front */}
        <div className="rounded-xl border border-border/60 bg-background/60 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mortgage}
              onChange={(e) => setMortgage(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <span className="text-sm text-foreground">{t("mortgageToggle")}</span>
          </label>

          {mortgage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pl-7"
            >
              <label htmlFor="dc-deposit" className="block text-xs text-muted-foreground mb-2">
                {t("depositLabel")}: <span className="text-foreground font-medium">{depositPct}%</span>
              </label>
              <input
                id="dc-deposit"
                type="range"
                min={20}
                max={60}
                step={5}
                value={depositPct}
                onChange={(e) => setDepositPct(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("mortgageHint")}
              </p>
            </motion.div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-[#b42318]">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md"
          style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              {t("submitBusy")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          {t("formFooter")}
        </p>
      </div>
    </div>
  );
}
