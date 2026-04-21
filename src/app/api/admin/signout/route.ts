import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/en/admin", req.url));
  // Clear the admin_secret cookie by setting maxAge to 0.
  // path and secure must match the session route so the browser deletes it.
  res.cookies.set("admin_secret", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
