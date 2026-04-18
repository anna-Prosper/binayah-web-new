export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import clientPromise from "@/lib/mongodb";

// Constant-time string comparison — pads both strings to equal length
function safeCompare(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  const aBytes = Buffer.from(a.padEnd(len, "\0"));
  const bBytes = Buffer.from(b.padEnd(len, "\0"));
  return timingSafeEqual(aBytes, bBytes);
}

function formatDate(d: unknown): string {
  if (!d) return "";
  try {
    return new Date(d as string).toLocaleString("en-GB", { timeZone: "Asia/Dubai" });
  } catch {
    return String(d);
  }
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return (
      <div style={{ fontFamily: "monospace", padding: "2rem" }}>
        503 — ADMIN_SECRET is not configured.
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const querySecret = resolvedParams.secret || "";
  const cookieSecret = cookieStore.get("admin_secret")?.value || "";
  const candidate = querySecret || cookieSecret;

  const isAuthed = candidate.length > 0 && safeCompare(candidate, adminSecret);

  if (!isAuthed) {
    return (
      <div style={{ fontFamily: "monospace", padding: "2rem", color: "#c00" }}>
        401 — Unauthorized
      </div>
    );
  }

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("property_submissions");

  const submissions = await col
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const cellStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "8px 12px",
    textAlign: "left",
    verticalAlign: "top",
    fontSize: 13,
  };
  const thStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#f5f5f5",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 24, background: "#fafafa", minHeight: "100vh" }}>
      <style>{`
        tr:hover td { background: #f0f7f4 !important; }
        a { color: #0B3D2E; }
      `}</style>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#0B3D2E" }}>
        Property Submissions — Agent Call List
      </h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
        {submissions.length} submission{submissions.length !== 1 ? "s" : ""} (newest first, limit 200)
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <thead>
            <tr>
              <th style={thStyle}>Date (Dubai)</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Community</th>
              <th style={thStyle}>Asking Price</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Description</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const status = (s.status as string) || "under_review";
              const normalized = status === "new" ? "under_review" : status;
              const badgeStyle: React.CSSProperties =
                normalized === "listed"
                  ? { display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: "#d1fae5", color: "#065f46" }
                  : normalized === "contacted"
                  ? { display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: "#dbeafe", color: "#1e40af" }
                  : { display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: "#fef3c7", color: "#92400e" };
              const statusLabel =
                normalized === "listed"
                  ? "Listed"
                  : normalized === "contacted"
                  ? "Agent Contacted"
                  : "Under Review";

              return (
                <tr key={String(s._id)}>
                  <td style={cellStyle}>{formatDate(s.createdAt)}</td>
                  <td style={cellStyle}>{(s.userEmail as string) || "—"}</td>
                  <td style={cellStyle}>{(s.propertyType as string) || "—"}</td>
                  <td style={cellStyle}>{(s.community as string) || "—"}</td>
                  <td style={cellStyle}>
                    {s.askingPrice ? `AED ${Number(s.askingPrice).toLocaleString()}` : "—"}
                  </td>
                  <td style={cellStyle}>
                    {s.phone ? (
                      <a href={`tel:${s.phone}`}>{s.phone as string}</a>
                    ) : "—"}
                  </td>
                  <td style={cellStyle}>
                    <span style={badgeStyle}>{statusLabel}</span>
                  </td>
                  <td style={{ ...cellStyle, maxWidth: 300, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {(s.description as string) || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
