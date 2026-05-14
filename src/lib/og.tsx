import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

interface OgProps {
  /** Small uppercase tag above the headline ("APPLE REPARATUR", "DONAUSTADT", …) */
  eyebrow?: string;
  /** The big bold first line. */
  primary: string;
  /** Smaller second line in white/55. */
  secondary?: string;
  /** Background CSS — gradient string. Defaults to the brand-blue radial. */
  background?: string;
}

/**
 * Single Satori renderer shared across all per-route OG image files. The
 * inputs vary, the layout doesn't — keeps the brand visual stable across
 * social shares so every elfixmobile preview is instantly recognisable.
 */
export function renderOg({ eyebrow, primary, secondary, background }: OgProps) {
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
            background ||
            "radial-gradient(ellipse 70% 55% at 50% 40%, #0a2a55 0%, #000000 65%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
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

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#0071E3",
                fontWeight: 500,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              fontSize: primary.length > 28 ? 80 : 110,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {primary}
          </div>
          {secondary && (
            <div
              style={{
                fontSize: secondary.length > 28 ? 64 : 88,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {secondary}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span>4,4 / 5 · 294 Bewertungen</span>
          <span>·</span>
          <span>Express in 30 Min</span>
          <span>·</span>
          <span>12 Monate Garantie</span>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
