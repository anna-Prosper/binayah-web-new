import { NextResponse } from "next/server";

import { resolveValuationUpstreamUrl } from "@/lib/valuation-api";

export const dynamic = "force-dynamic";

const bytesPerMegabyte = 1024 * 1024;
const defaultDocumentMaxFileSizeMb = 8;
const documentAcceptedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif"];
const documentAcceptedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export async function GET() {
  const turnstileEnabled = normalizeBoolean(process.env.VALUATION_TURNSTILE_ENABLED, false);
  const turnstileSiteKey = normalizeText(process.env.TURNSTILE_SITE_KEY);
  const turnstileSecretKey = normalizeText(process.env.TURNSTILE_SECRET_KEY);
  const documentMaxFileSizeMb = normalizePositiveInteger(
    process.env.VALUATION_DOCUMENT_MAX_FILE_MB,
    defaultDocumentMaxFileSizeMb,
  );
  const valuationServiceConfigured = Boolean(
    resolveValuationUpstreamUrl("stream") ||
    resolveValuationUpstreamUrl("document") ||
    resolveValuationUpstreamUrl("unlock"),
  );

  return NextResponse.json(
    {
      turnstile: {
        enabled: turnstileEnabled,
        configured: !turnstileEnabled || Boolean(turnstileSiteKey && turnstileSecretKey),
        siteKey: turnstileEnabled ? turnstileSiteKey : "",
        action: "valuation_submit",
      },
      documentUpload: {
        enabled: true,
        configured: valuationServiceConfigured,
        maxFileSizeMb: documentMaxFileSizeMb,
        maxFileSizeBytes: documentMaxFileSizeMb * bytesPerMegabyte,
        accept: documentAcceptedExtensions.join(","),
        acceptedLabel: "PDF, PNG, JPG/JPEG, WEBP, or GIF",
        acceptedExtensions: documentAcceptedExtensions,
        acceptedMimeTypes: documentAcceptedMimeTypes,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function normalizeBoolean(value: string | undefined, fallback: boolean) {
  const normalized = normalizeText(value).toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function normalizePositiveInteger(value: string | undefined, fallback: number) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return fallback;
  }

  return Math.max(1, Math.round(amount));
}

function normalizeText(value: string | undefined | null) {
  return String(value ?? "").trim();
}
