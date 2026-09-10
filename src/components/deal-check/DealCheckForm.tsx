/* eslint-disable i18next/no-literal-string -- English-only tool copy, matching the valuation page pattern */
"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
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

const tabs: { id: SubmitMode; label: string; icon: typeof Link2 }[] = [
  { id: "url", label: "Paste a link", icon: Link2 },
  { id: "image", label: "Upload a screenshot", icon: Upload },
  { id: "text", label: "Paste the details", icon: Type },
];

export default function DealCheckForm({ onSubmit, busy }: Props) {
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
      setError("That file type isn't supported. Upload a screenshot or a PDF brochure.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`That file is over ${MAX_IMAGE_MB}MB. Try a smaller screenshot.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
    };
    reader.onerror = () => setError("We couldn't read that file. Try another.");
    reader.readAsDataURL(file);
  }, []);

  const submit = () => {
    setError(null);

    if (mode === "url") {
      const trimmed = url.trim();
      if (!trimmed) return setError("Paste the link to the property listing.");
      if (!/^https?:\/\//i.test(trimmed)) {
        return setError("That doesn't look like a web address. It should start with https://");
      }
      return onSubmit({ url: trimmed, mortgage, downPaymentPct: mortgage ? depositPct / 100 : null });
    }

    if (mode === "image") {
      if (!image) return setError("Choose a screenshot or brochure to upload.");
      return onSubmit({ image, mortgage, downPaymentPct: mortgage ? depositPct / 100 : null });
    }

    const trimmed = text.trim();
    if (trimmed.length < 25) {
      return setError("Add a bit more detail — price, size, bedrooms and the community.");
    }
    return onSubmit({ text: trimmed, mortgage, downPaymentPct: mortgage ? depositPct / 100 : null });
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border/50" role="tablist">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setMode(t.id);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium transition-colors ${
                active
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        {mode === "url" && (
          <div>
            <label htmlFor="dc-url" className="block text-sm font-medium text-foreground mb-2">
              Link to the listing
            </label>
            <input
              id="dc-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
              placeholder="https://..."
              className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Any portal, any agency — it doesn&apos;t have to be a Binayah listing. Some portals block
              automated reads; if that happens we&apos;ll ask you for a screenshot instead.
            </p>
          </div>
        )}

        {mode === "image" && (
          <div>
            <span className="block text-sm font-medium text-foreground mb-2">
              Screenshot or brochure
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
                  aria-label="Remove file"
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
                  Drop a file here, or click to choose
                </span>
                <span className="block text-xs text-muted-foreground mt-1">
                  PNG, JPG or PDF, up to {MAX_IMAGE_MB}MB
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
              The listing details
            </label>
            <textarea
              id="dc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={
                "Paste whatever you have — for example:\n\n2-bed apartment, Business Bay, 1,150 sqft, AED 2.4M, service charge AED 18/sqft, currently rented at AED 130,000"
              }
              className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all resize-y"
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
            <span className="text-sm text-foreground">I&apos;m planning to use a mortgage</span>
          </label>

          {mortgage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pl-7"
            >
              <label htmlFor="dc-deposit" className="block text-xs text-muted-foreground mb-2">
                Deposit: <span className="text-foreground font-medium">{depositPct}%</span>
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
                Expat buyers can usually borrow up to 75% on a ready property under AED 5M, and 50%
                on off-plan. Since 2025 the DLD fee and agency commission can&apos;t be added to the
                loan — they have to be paid in cash.
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
              Checking the deal…
            </>
          ) : (
            <>
              Check this deal
              <ArrowRight className="w-4 h-4" aria-hidden />
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Free, no sign-up, and you get the full assessment — we don&apos;t hide the numbers behind a form.
        </p>
      </div>
    </div>
  );
}
