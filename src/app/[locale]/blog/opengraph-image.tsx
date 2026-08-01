import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg({
    eyebrow: "EL FIX MOBILE WIEN",
    primary: "Ratgeber & Glossar.",
    secondary: "Wissen aus der Werkstatt.",
  });
}
