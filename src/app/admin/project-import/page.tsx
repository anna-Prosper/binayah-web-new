"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const DEFAULT_JSON = `{
  "title": "Fior 2",
  "price": "1,800,000 AED",
  "address": "Dubai, Mina Rashid",
  "thumbnail": "https://new-projects-media.propertyfinder.com/project/7d0e9013-b01e-4a5f-a541-b62c6b5dd378/gallery/image/1wkSOfBOqUNIT-Ye36Rkuk_Nv63xZFsrs8rEydpy4ho=/medium.webp",
  "beds": "3",
  "baths": "2",
  "url": "https://www.propertyfinder.ae/en/new-projects/emaar-properties/fior-2",
  "description": "About the project ...",
  "developer": "Developer Emaar Properties",
  "features": ["Fior 2", "From: 2.1M AED"],
  "images": ["https://new-projects-media.propertyfinder.com/project/.../big.webp"],
  "latitude": "25.273713",
  "longitude": "55.284211",
  "map_url": "https://www.google.com/maps?q=25.273713,55.284211",
  "local_images": ["output/images/propertyfinder_ae/property_19_fior_2/image_000.webp"],
  "brochures": []
}`;

function safeParse(raw: string) {
  try {
    const val = JSON.parse(raw);
    return { ok: true, value: val } as const;
  } catch (err: any) {
    return { ok: false, error: err?.message || "Invalid JSON" } as const;
  }
}

export default function ProjectImportAdminPage() {
  const [secret, setSecret] = useState("");
  const [jsonText, setJsonText] = useState(DEFAULT_JSON);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("projectImportSecret");
    if (saved) setSecret(saved);
  }, []);

  const parsed = useMemo(() => safeParse(jsonText), [jsonText]);
  const itemCount = useMemo(() => {
    if (!parsed.ok) return 0;
    return Array.isArray(parsed.value) ? parsed.value.length : 1;
  }, [parsed]);

  const handleImport = async () => {
    setStatus(null);
    setResult(null);

    if (!secret.trim()) {
      setStatus("Missing import secret.");
      return;
    }
    if (!parsed.ok) {
      setStatus(`Invalid JSON: ${parsed.error}`);
      return;
    }

    setIsSubmitting(true);
    try {
      window.localStorage.setItem("projectImportSecret", secret.trim());
      const res = await fetch("/api/project-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-import-secret": secret.trim(),
        },
        body: JSON.stringify(parsed.value),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error || "Import failed.");
      } else {
        setStatus("Import completed.");
      }
      setResult(data);
    } catch (err: any) {
      setStatus(err?.message || "Import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Project Import</h1>
            <p className="text-sm text-muted-foreground mt-1">Paste JSON and send to the import API.</p>
          </div>
          <Link href="/" className="text-sm text-primary hover:underline">Back to site</Link>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Import Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="PROJECT_IMPORT_SECRET"
              className="mt-1 w-full h-10 rounded-xl bg-muted/40 border border-border/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground">Payload JSON</label>
              <span className={`text-[11px] ${parsed.ok ? "text-emerald-600" : "text-rose-600"}`}>
                {parsed.ok ? `Valid · ${itemCount} item${itemCount === 1 ? "" : "s"}` : "Invalid JSON"}
              </span>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={16}
              className="w-full rounded-xl bg-muted/30 border border-border/50 px-3 py-2 text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={handleImport}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60"
            >
              {isSubmitting ? "Importing..." : "Import Now"}
            </button>
            {status && (
              <span className="text-xs text-muted-foreground">{status}</span>
            )}
          </div>

          {result && (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Result</p>
              <pre className="text-[11px] whitespace-pre-wrap break-words text-muted-foreground">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
