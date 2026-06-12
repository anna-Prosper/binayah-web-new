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

  // 1. Optional webhook (Slack/Zapier/CRM) when configured.
  const url = process.env.LEADS_WEBHOOK_URL;
  if (url) {
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

  // 2. WhatsApp alert to the team group — the primary live channel.
  const base = process.env.WHATSAPP_API_BASE_URL;
  const key = process.env.WHATSAPP_API_KEY;
  const group = process.env.WHATSAPP_GROUP_JID;
  if (base && key && group) {
    fetch(`${base}/api/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify({ to: group, text: buildLeadMessage(full) }),
      signal: AbortSignal.timeout(5_000),
    }).catch((err: Error) => {
      console.error("[notifyNewLead] whatsapp failed:", err.message);
    });
  }
}

const SOURCE_LABEL: Record<string, string> = {
  inquiry: "Property Inquiry",
  newsletter: "Newsletter / Market Report",
  "list-property": "List Your Property",
  "project-subscribe": "Project Updates",
  valuation: "Property Valuation",
};

function buildLeadMessage(p: NewLeadWebhookPayload): string {
  const lines: string[] = ["🔔 *New Lead — Binayah*", "", `Type: ${SOURCE_LABEL[p.source] ?? p.source}`];
  if (p.name) lines.push(`Name: ${p.name}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  if (p.community) lines.push(`Area: ${p.community}`);
  if (p.intent?.length) lines.push(`Intent: ${p.intent.join(", ")}`);
  if (p.property?.title) lines.push(`Property: ${p.property.title}`);
  if (p.project?.name) lines.push(`Project: ${p.project.name}`);
  if (p.message) lines.push(`Message: ${p.message.slice(0, 300)}`);
  if (p.channel && p.channel !== p.source) lines.push(`Channel: ${p.channel}`);
  lines.push("", `View: ${p.adminUrl}`);
  return lines.join("\n");
}
