import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/** Escape characters that have special meaning in HTML. */
function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") || "").trim();

  const brandGreen = "#0B3D2E";

  const renderPage = (title: string, message: string, isError = false) =>
    new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title} — Binayah Properties</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f9fafb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:40px 32px;max-width:440px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.06);text-align:center}
    .icon{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,${brandGreen},#1A7A5A);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px}
    h1{font-size:1.4rem;color:${brandGreen};margin-bottom:8px}
    p{color:#6b7280;font-size:0.9375rem;line-height:1.6;margin-bottom:16px}
    .error{color:#dc2626}
    a{display:inline-block;margin-top:8px;color:${brandGreen};font-weight:600;font-size:0.875rem;text-decoration:none}
    a:hover{text-decoration:underline}
    .footer{margin-top:28px;padding-top:20px;border-top:1px solid #f3f4f6;color:#d1d5db;font-size:0.75rem}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        ${isError
          ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
          : '<polyline points="20 6 9 17 4 12"/>'}
      </svg>
    </div>
    <h1 class="${isError ? "error" : ""}">${title}</h1>
    <p>${message}</p>
    <a href="/">Return to Binayah Properties</a>
    <div class="footer">Binayah Properties &mdash; Dubai Real Estate</div>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );

  if (!token) {
    return renderPage(
      "Invalid link",
      "This unsubscribe link is missing or invalid. Please use the link from your subscription email.",
      true
    );
  }

  try {
    const client = await clientPromise;
    const subscriptions = client
      .db("binayah_web_new_dev")
      .collection("project_subscriptions");

    const row = await subscriptions.findOne({ unsubscribeToken: token });
    if (!row) {
      return renderPage(
        "Already unsubscribed",
        "This unsubscribe link has already been used, or the subscription could not be found. You will not receive further emails.",
        false
      );
    }

    await subscriptions.deleteOne({ unsubscribeToken: token });

    return renderPage(
      "Unsubscribed",
      `You've been unsubscribed from updates for <strong>${escHtml(String(row.projectName ?? row.slug))}</strong>. You won't receive any further emails about this project.`
    );
  } catch (err) {
    console.error("[unsubscribe]", err);
    return renderPage(
      "Something went wrong",
      "We couldn't process your unsubscribe request right now. Please try again later.",
      true
    );
  }
}
