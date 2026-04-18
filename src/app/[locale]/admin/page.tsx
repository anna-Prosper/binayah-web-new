export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export default async function AdminLandingPage({
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
        401 — Unauthorized. Append ?secret=YOUR_SECRET to the URL.
      </div>
    );
  }

  const secretParam = querySecret ? `?secret=${querySecret}` : "";

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: 0,
        padding: 32,
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#0B3D2E" }}>
        Binayah Admin
      </h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>
        Select a section to view:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
        <a
          href={`inquiries${secretParam}`}
          style={{
            display: "block",
            padding: "16px 20px",
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderLeft: "4px solid #1A7A5A",
            borderRadius: 8,
            textDecoration: "none",
            color: "#0B3D2E",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          Inquiries
          <span style={{ display: "block", fontWeight: 400, fontSize: 13, color: "#666", marginTop: 4 }}>
            All contact/property inquiries, newest first
          </span>
        </a>
        <a
          href={`submissions${secretParam}`}
          style={{
            display: "block",
            padding: "16px 20px",
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderLeft: "4px solid #D4A847",
            borderRadius: 8,
            textDecoration: "none",
            color: "#0B3D2E",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          Property Submissions
          <span style={{ display: "block", fontWeight: 400, fontSize: 13, color: "#666", marginTop: 4 }}>
            List-your-property form submissions
          </span>
        </a>
      </div>
    </div>
  );
}
