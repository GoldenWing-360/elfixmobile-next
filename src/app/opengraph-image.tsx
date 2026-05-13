import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "EL Fix Mobile - Handy Reparatur Wien 1220";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, #0a2a55 0%, #000000 65%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        {/* Logo bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "white",
              color: "black",
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
            }}
          >
            EL
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>
            FIX MOBILE
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "#0071E3",
              fontWeight: 500,
            }}
          >
            HANDY REPARATUR WIEN 1220
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            Wie neu.
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            In 30 Minuten.
          </div>
        </div>

        {/* Footer: trust signals */}
        <div style={{ display: "flex", gap: 32, fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
          <span>★ 4,4 / 5 · 294 Bewertungen</span>
          <span>·</span>
          <span>Express in 30 Min</span>
          <span>·</span>
          <span>12 Monate Garantie</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
