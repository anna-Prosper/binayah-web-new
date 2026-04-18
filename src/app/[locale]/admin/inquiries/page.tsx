export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import crypto, { timingSafeEqual } from "crypto";
import clientPromise from "@/lib/mongodb";

function safeCompare(candidate: string, secret: string): boolean {
  const key = "binayah-admin-compare";
  const a = crypto.createHmac("sha256", key).update(candidate).digest();
  const b = crypto.createHmac("sha256", key).update(secret).digest();
  return timingSafeEqual(a, b);
}

function formatDate(d: unknown): string {
  if (!d) return "";
  try {
    return new Date(d as string).toLocaleString("en-GB", { timeZone: "Asia/Dubai" });
  } catch {
    return String(d);
  }
}

export default async function AdminInquiriesPage() {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return (
      <div style={{ fontFamily: "monospace", padding: "2rem" }}>
        503 — ADMIN_SECRET is not configured.
      </div>
    );
  }

  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_secret")?.value || "";
  const isAuthed = cookieSecret.length > 0 && safeCompare(cookieSecret, adminSecret);

  if (!isAuthed) {
    return (
      <div style={{ fontFamily: "monospace", padding: "2rem", color: "#c00" }}>
        401 — Unauthorized. Visit /api/admin/session?secret=YOUR_SECRET to sign in.
      </div>
    );
  }

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("inquiries");

  const inquiries = await col
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
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: 0,
        padding: 24,
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <style>{`
        tr:hover td { background: #f0f7f4 !important; }
        a { color: #0B3D2E; }
      `}</style>
      {/* Nav */}
      <div style={{ marginBottom: 16 }}>
        <a href=".." style={{ fontSize: 13, color: "#1A7A5A" }}>
          &larr; Back to Admin
        </a>
      </div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#0B3D2E" }}>
        Inquiries — CRM
      </h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
        {inquiries.length} inquir{inquiries.length !== 1 ? "ies" : "y"} (newest first, limit 200)
      </p>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Date (Dubai)</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Message</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#999" }}>
                  No inquiries yet.
                </td>
              </tr>
            )}
            {inquiries.map((row) => (
              <tr key={String(row._id)}>
                <td style={cellStyle}>{formatDate(row.createdAt)}</td>
                <td style={cellStyle}>{(row.name as string) || "—"}</td>
                <td style={cellStyle}>
                  {row.email ? (
                    <a href={`mailto:${row.email as string}`}>{row.email as string}</a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={cellStyle}>
                  {row.phone ? (
                    <a href={`tel:${(row.phone as string).replace(/\s/g, "")}`}>
                      {row.phone as string}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={cellStyle}>{(row.source as string) || "—"}</td>
                <td style={cellStyle}>{(row.type as string) || "—"}</td>
                <td
                  style={{
                    ...cellStyle,
                    maxWidth: 320,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {(row.message as string) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
