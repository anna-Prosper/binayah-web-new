export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto, { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const key = "binayah-admin-compare";
  const ha = crypto.createHmac("sha256", key).update(a).digest();
  const hb = crypto.createHmac("sha256", key).update(b).digest();
  return timingSafeEqual(ha, hb);
}

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token, locale } = await params;
  const pathToken = process.env.ADMIN_PATH_TOKEN;

  // Wrong token → 404, not a login page hint
  if (!pathToken || !safeCompare(token, pathToken)) {
    notFound();
  }

  // Already authed → go straight to dashboard
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get("admin_secret")?.value || "";
    if (cookieVal.length > 0 && safeCompare(cookieVal, adminSecret)) {
      redirect(`/${locale}/admin`);
    }
  }

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 12,
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", color: "#0B3D2E", marginBottom: "0.25rem" }}>
          Binayah Admin
        </h1>
        <p style={{ color: "#888", fontSize: 13, marginBottom: "1.5rem" }}>
          Enter your admin password to continue.
        </p>
        <form id="admin-login-form" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            name="secret"
            placeholder="Admin password"
            autoComplete="current-password"
            required
            style={{
              padding: "10px 14px",
              border: "1px solid #d0d0d0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              background: "#0B3D2E",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Sign in
          </button>
          <p
            id="admin-login-error"
            style={{ color: "#c00", fontSize: 13, display: "none", margin: 0 }}
          >
            Incorrect password.
          </p>
        </form>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                const secret = this.secret.value;
                const err = document.getElementById('admin-login-error');
                err.style.display = 'none';
                const res = await fetch('/api/admin/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ secret }),
                });
                if (res.ok) {
                  window.location.href = '/en/admin';
                } else {
                  err.style.display = 'block';
                }
              });
            `,
          }}
        />
      </div>
    </div>
  );
}
