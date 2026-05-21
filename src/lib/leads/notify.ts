// ── New-lead webhook ────────────────────────────────────────────────────────
// Fire-and-forget POST to LEADS_WEBHOOK_URL whenever a new lead is created.
// Failures are logged but never block the originating request — the user-
// facing form submission must always succeed even if the webhook is down.
//
// Payload shape is stable and documented so downstream consumers (Slack,
// Zapier, n8n, internal CRM) can rely on it.

import type { LeadSource } from "./types";

export interface NewLeadWebhookPayload {
  event: "lead.created";
  source: LeadSource;
  channel?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  property?: { slug?: string; title?: string };
  project?: { slug?: string; name?: string };
  community?: string;
  intent?: string[];
  createdAt: string;
  // Convenience link an ops person can click to open the lead in admin.
  adminUrl: string;
}

export function notifyNewLead(
  payload: Omit<NewLeadWebhookPayload, "event" | "adminUrl" | "createdAt"> & {
    createdAt?: string;
  }
): void {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae";
  const full: NewLeadWebhookPayload = {
    event: "lead.created",
    source: payload.source,
    channel: payload.channel,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
    property: payload.property,
    project: payload.project,
    community: payload.community,
    intent: payload.intent,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    adminUrl: `${site}/admin/leads`,
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(full),
    // Reasonable cap so a slow webhook can't pin a serverless function.
    signal: AbortSignal.timeout(5_000),
  }).catch((err: Error) => {
    console.error("[notifyNewLead] webhook failed:", err.message);
  });
}
