/* eslint-disable i18next/no-literal-string */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const metric = searchParams.get("metric") || "Dubai property market";
  const value = searchParams.get("value") || "+2.4%";
  const trend = searchParams.get("trend") || "up";
  const area = searchParams.get("area") || "Dubai";

  const trendColor = trend === "up" ? "#4CAF50" : trend === "down" ? "#ef4444" : "#D4A847";
  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Gold accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(to right, #D4A847, #B8922F)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "56px 72px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#D4A847",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              BINAYAH PROPERTIES
            </div>
            <div
              style={{
                width: "1px",
                height: "14px",
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              PULSE WEEKLY DISPATCH
            </div>
          </div>

          {/* Main metric */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {area}
            </div>
            <div
              style={{
                fontSize: "68px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {metric}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: trendColor,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{trendArrow}</span>
                <span>{value}</span>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.05em",
                }}
              >
                month over month
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.1em",
              }}
            >
              staging.binayahhub.com/pulse
            </div>
            <div
              style={{
                background: "linear-gradient(to right, #D4A847, #B8922F)",
                padding: "10px 24px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.05em",
              }}
            >
              Monday Dispatch
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
