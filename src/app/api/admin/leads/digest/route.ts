import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { computeLeadStats } from "@/lib/leads/stats";
import { listLeads } from "@/lib/leads/federation";
import { sendMail } from "@/lib/mailer";
import type { UnifiedLead } from "@/lib/leads/types";

export const dynamic = "force-dynamic";

// GET /api/admin/leads/digest
//
// Two callers:
//   1. Vercel Cron (vercel.json) hits with ?cron=1 — auth via CRON_SECRET header.
//   2. An admin can hit it manually to preview / re-send.
//
// Behavior: computes daily stats, fetches "needs attention" leads (created
// in the last 24h still in `new`, or older than 24h with no contact note),
// renders an HTML digest, and emails to LEADS_DIGEST_RECIPIENTS (CSV).
function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function rowsHtml(leads: UnifiedLead[]): string {
  if (leads.length === 0) return "<tr><td colspan='4' style='padding:8px;color:#999'>None 🎉</td></tr>";
  return leads
    .slice(0, 15)
    .map(
      (l) => `
        <tr style="border-top:1px solid #eee">
          <td style="padding:8px;font-size:13px"><strong>${escape(l.name || "(no name)")}</strong></td>
          <td style="padding:8px;font-size:12px;color:#555">${escape(l.email || l.phone || "—")}</td>
          <td style="padding:8px;font-size:12px;color:#555">${escape(l.source)}${l.community ? ` · ${escape(l.community)}` : ""}</td>
          <td style="padding:8px;font-size:11px;color:#888">${new Date(l.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
        </tr>`
    )
    .join("");
}

function escape(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] || c));
}

export async function GET(req: NextRequest) {
  const isCron = req.nextUrl.searchParams.get("cron") === "1";
  const authorized = isCron ? isAuthorizedCron(req) : await isAdminSession();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipients = (process.env.LEADS_DIGEST_RECIPIENTS || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No LEADS_DIGEST_RECIPIENTS or ADMIN_EMAILS configured" },
      { status: 500 }
    );
  }

  // Pull stats + actionable lists in parallel.
  const last24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last48 = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [stats, brandNew, waiting] = await Promise.all([
    computeLeadStats(),
    listLeads({
      status: ["new"],
      from: last24,
      sort: "createdAt:desc",
      page: 1,
      limit: 50,
    }),
    listLeads({
      status: ["new"],
      to: last24,
      from: last48,
      sort: "createdAt:asc",
      page: 1,
      limit: 50,
    }),
  ]);

  const now = new Date();
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#222">
      <div style="background:linear-gradient(135deg,#0B3D2E,#1A7A5A);color:#fff;padding:20px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;font-size:22px">Binayah leads digest — ${fmt(now)}</h1>
        <p style="margin:6px 0 0;color:#cfead8;font-size:13px">Yesterday's wrap-up + what needs attention today</p>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:24px">

        <h2 style="font-size:14px;color:#555;margin:0 0 12px;letter-spacing:0.5px;text-transform:uppercase">Snapshot</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:12px;background:#f4f9f6;border-radius:8px"><div style="font-size:11px;color:#666">Open</div><div style="font-size:22px;font-weight:bold;color:#0B3D2E">${stats.open}</div></td>
            <td style="width:8px"></td>
            <td style="padding:12px;background:#eff5fb;border-radius:8px"><div style="font-size:11px;color:#666">New last 7 days</div><div style="font-size:22px;font-weight:bold;color:#1d4ed8">${stats.last7Days}</div></td>
            <td style="width:8px"></td>
            <td style="padding:12px;background:#fdf4e8;border-radius:8px"><div style="font-size:11px;color:#666">Avg first response</div><div style="font-size:22px;font-weight:bold;color:#a16207">${stats.avgTimeToContactMs ? formatDuration(stats.avgTimeToContactMs) : "—"}</div></td>
          </tr>
        </table>

        <h2 style="font-size:14px;color:#555;margin:24px 0 8px;letter-spacing:0.5px;text-transform:uppercase">New leads in last 24h (${brandNew.total})</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          ${rowsHtml(brandNew.leads)}
        </table>

        <h2 style="font-size:14px;color:#b91c1c;margin:24px 0 8px;letter-spacing:0.5px;text-transform:uppercase">⚠️ Waiting > 24h, still uncontacted (${waiting.total})</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          ${rowsHtml(waiting.leads)}
        </table>

        ${stats.topProperties.length > 0 ? `
          <h2 style="font-size:14px;color:#555;margin:24px 0 8px;letter-spacing:0.5px;text-transform:uppercase">Most-inquired this period</h2>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#444">
            ${stats.topProperties.slice(0, 5).map((p) => `<li>${escape(p.title)} <span style="color:#888">— ${p.count} inquiries</span></li>`).join("")}
          </ul>
        ` : ""}

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae"}/admin/leads" style="color:#0B3D2E;text-decoration:none;font-weight:600">Open leads dashboard →</a>
        </div>
      </div>
    </div>
  `;

  try {
    await sendMail({
      to: recipients.join(", "),
      subject: `Binayah leads — ${brandNew.total} new in last 24h, ${waiting.total} waiting`,
      html,
    });
    return NextResponse.json({
      sent: true,
      recipients,
      summary: {
        open: stats.open,
        newLast24h: brandNew.total,
        waiting: waiting.total,
      },
    });
  } catch (err) {
    console.error("[leads/digest] mail failed:", err);
    return NextResponse.json({ error: "Mail failed" }, { status: 500 });
  }
}

function formatDuration(ms: number): string {
  const minutes = ms / 60_000;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}
