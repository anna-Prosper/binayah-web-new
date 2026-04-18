import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

// Dev-only endpoint so QA agents can get a valid session cookie without Google OAuth.
// Blocked in production — never ships with real auth bypass.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "NEXTAUTH_SECRET not set" }, { status: 500 });
  }

  const token = await encode({
    secret,
    token: {
      sub: "test-user-qa-seed",
      name: "QA Test User",
      email: "qa@test.binayah.com",
      picture: null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
      jti: crypto.randomUUID(),
    },
  });

  const cookieName = "next-auth.session-token";
  const response = NextResponse.json({ ok: true, user: "qa@test.binayah.com" });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
