export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import crypto, { timingSafeEqual } from "crypto";
import { isAdminSession } from "@/lib/admin-auth";

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

  // Wrong token → 404, not even a hint this is a login page
  if (!pathToken || !safeCompare(token, pathToken)) {
    notFound();
  }

  // Already signed in with an allowed Google account → go straight to dashboard
  if (await isAdminSession()) {
    redirect(`/${locale}/admin`);
  }

  const callbackUrl = encodeURIComponent(`/${locale}/admin`);
  const googleSignInUrl = `/api/auth/signin/google?callbackUrl=${callbackUrl}`;

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
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#0B3D2E",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🔒
          </div>
          <h1 style={{ fontSize: "1.25rem", color: "#0B3D2E", marginBottom: "0.25rem" }}>
            Binayah Admin
          </h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            Sign in with your approved Google account to continue.
          </p>
        </div>

        <a
          href={googleSignInUrl}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "11px 16px",
            background: "#fff",
            border: "1.5px solid #d0d0d0",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#1a1a1a",
            textDecoration: "none",
            cursor: "pointer",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </a>

        <p style={{ color: "#bbb", fontSize: 11, marginTop: "1.25rem" }}>
          Access is restricted to approved accounts only.
        </p>
      </div>
    </div>
  );
}
