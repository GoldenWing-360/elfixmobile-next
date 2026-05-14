import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "EL Fix Mobile - Handy Reparatur Wien 1220";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OG() {
  return renderOg({
    eyebrow: "HANDY REPARATUR WIEN 1220",
    primary: "Wie neu.",
    secondary: "In 30 Minuten.",
  });
}
