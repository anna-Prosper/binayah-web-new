"use server";

import { redirect } from "next/navigation";
import { serverApiUrl } from "@/lib/api";

/**
 * Unsubscribe, on POST only.
 *
 * The page used to unsubscribe while RENDERING, so a GET mutated. That is not
 * a style objection: corporate mail security — Outlook Safe Links, Mimecast,
 * Proofpoint — fetches every URL in an inbound message to scan it, and so do
 * link prefetchers. Each of those scans silently unsubscribed the reader
 * before they had opened the email, and the list would shrink with nobody
 * having clicked anything. It was measured, not theorised: a plain GET of a
 * fresh token flipped unsubscribedAt.
 *
 * So the destructive step now needs a real submission. The RFC 8058 one-click
 * endpoint on the API is untouched and still POSTs, which is what mail clients
 * use for their native unsubscribe button — that path was always correct, it
 * was only the human-facing page that mutated on read.
 *
 * A plain <form action> rather than client JS, so it still works with
 * scripting disabled.
 */
export async function unsubscribeAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const prefix = locale === "en" ? "" : `/${locale}`;

  let state: "done" | "notfound" | "error" = "error";
  if (token) {
    try {
      const res = await fetch(serverApiUrl(`/api/market-report/unsubscribe/${token}`), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "source=web",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      // The API is idempotent: a token already unsubscribed still answers 200,
      // so a double submit reads as success rather than as a broken link.
      state = res.ok ? "done" : res.status === 404 ? "notfound" : "error";
    } catch {
      state = "error";
    }
  }
  redirect(`${prefix}/pulse/unsubscribe/${token}?state=${state}`);
}
