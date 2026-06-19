/* eslint-disable i18next/no-literal-string -- OG image text, not page copy */
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared branded OG image for landing pages — a gradient background with the
 * Binayah wordmark, an eyebrow label and the page title. No remote images or
 * custom fonts (Arial only), so it renders reliably on the edge runtime.
 */
export function renderLandingOg({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          fontFamily: "Arial, sans-serif",
          background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)",
          overflow: "hidden",
        }}
      >
        {/* Soft accent glow */}
        <div style={{ position: "absolute", top: "-160px", right: "-120px", width: "520px", height: "520px", borderRadius: "9999px", background: "rgba(212,168,71,0.18)", display: "flex" }} />
        {/* Gold bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(to right, #D4A847, #B8922F)" }} />

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: "15px", color: "#D4A847", letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700 }}>
              BINAYAH PROPERTIES
            </div>
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.3)", margin: "0 18px" }} />
            <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {eyebrow}
            </div>
          </div>

          {/* Title + trust line */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: title.length > 38 ? "56px" : "68px", fontWeight: 700, color: "#ffffff", lineHeight: 1.08, letterSpacing: "-0.01em" }}>
              {title.length > 80 ? title.slice(0, 77) + "..." : title}
            </div>
            <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.75)" }}>
              Trusted since 2007 · 3,000+ properties · 11,200+ clients
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    }
  );
}
