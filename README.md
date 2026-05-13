# elfixmobile-next

Apple-style Next.js rebuild of elfixmobile.at — Vienna 1220 Aspern handy
repair shop. Stack: Next.js 16 + React 19 + Tailwind 4 + next-intl
(de/en/ru/tr). Deploy: Cloudflare Workers via OpenNext.

Live preview: <https://elfixmobile-next.deni-4b0.workers.dev>

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Build & deploy

```bash
pnpm build        # plain Next build (sanity check)
pnpm cf:build     # OpenNext build → .open-next/worker.js
pnpm cf:preview   # local Workers preview via wrangler
pnpm cf:deploy    # build + push to Cloudflare
```

The Worker reads two pieces of remote state:

- `LEADS_KV` namespace (`d27db3d6fa2941c694318838f925ea12`) holds rate-
  limit counters, dedup hashes, and lead persistence. Wired via
  `wrangler.jsonc`.
- `RESEND_API_KEY` secret. Without it, `/api/lead` accepts and persists
  leads but skips sending email; set via `wrangler secret put
  RESEND_API_KEY`.

## Swapping the logo

The current logo is at `public/logo-light.svg` (and an identical
`public/logo.svg`). It's a wordmark designed for **dark backgrounds**;
the rebuild's nav and footer are both dark, so a single asset is enough
for now.

### Files to drop

Replace these:

| Path | Used by | Notes |
| --- | --- | --- |
| `public/logo-light.svg` | `src/components/Nav.tsx`, `src/components/Footer.tsx` | Primary asset, renders white-on-dark |
| `public/logo.svg` | (currently unused) | Optional dark-on-light variant; keep identical to `logo-light.svg` if you don't need it yet |

If you go the two-variant route (e.g., the new design needs a different
treatment on light surfaces), keep both files and ask for a Light/Dark
component switch — it's a 10-line addition.

### Aspect ratio constraint

The `<Image>` component in `Nav.tsx` is hard-coded to `width={200}
height={60}` (a 3.33:1 ratio). If your new SVG isn't 3.33:1, **either**:

1. Adjust the SVG's `viewBox` to 200×60 (preferred — keeps the existing
   layout) **or**
2. Update `width` + `height` in `Nav.tsx` line ~63 and `Footer.tsx` line
   ~55 to match the new ratio.

Don't mix the two — the wrong ratio will stretch the mark.

### Favicon + Apple touch icon

Next.js 16 picks up these files automatically from `src/app/`:

| Filename | Format | Purpose |
| --- | --- | --- |
| `src/app/icon.png` | 32×32 PNG | Browser tab |
| `src/app/apple-icon.png` | 180×180 PNG | iOS home-screen |

Drop the files in and the next build wires them into `<head>`.

### OG image

`src/app/opengraph-image.tsx` currently hand-renders a logo block (white
"EL" tile + "FIX MOBILE" wordmark) at the top-left. That's a Satori-
rendered React component, not the SVG, so when the new logo lands we
have two options:

1. Leave the OG hand-render as is and update its colours/typography to
   match the new mark (cheapest).
2. Inline the SVG path data and let Satori draw it (cleaner, but Satori
   has a subset of SVG support — needs testing).

Either way the file lives at `src/app/opengraph-image.tsx`; the build
output appears at `/opengraph-image` and is consumed by the
`openGraph.images` field that Next.js wires automatically from the
file-convention.

### After swapping — sanity checklist

```bash
pnpm cf:deploy
```

Then verify:

- `/de` — nav logo renders cleanly on dark hero
- `/de/kontakt` — nav logo on light page (glass-nav backdrop is dark, so
  white logo should still be readable)
- `/sitemap.xml` — unchanged
- View source on any page → `<meta property="og:image">` points at
  `/opengraph-image` → load the URL in a browser tab → confirm the OG
  render

If any of the above looks off, the culprit is usually the
`<Image width={…} height={…}>` declaration not matching the new SVG
viewBox.

## Project layout

```
src/
├── app/
│   ├── [locale]/
│   │   ├── reparatur/[brand]/page.tsx          # 32 brand SEO landings
│   │   ├── reparatur/[brand]/[model]/page.tsx  # 876 per-model pages
│   │   ├── [service]/page.tsx                  # 24 service-route landings
│   │   ├── status/[id]/page.tsx                # Customer status tracker
│   │   ├── buchen/page.tsx                     # Multi-step booking
│   │   ├── preisrechner/page.tsx               # Price calculator
│   │   ├── kontakt, impressum, datenschutz, agb
│   │   └── page.tsx                            # Home
│   ├── api/lead/route.ts                       # Lead intake → KV + Resend
│   ├── sitemap.ts                              # 960 URLs
│   └── opengraph-image.tsx                     # Satori OG render
├── components/
│   ├── Nav.tsx, Footer.tsx, Button.tsx         # Layout primitives
│   ├── StickyMobileCTA.tsx                     # Bottom action bar (mobile)
│   ├── brand/, service/, contact/, calc/, book/, sections/, hero/
├── data/
│   ├── brands.ts, services.ts, pricing.json    # Source-of-truth registries
│   ├── repair-labels.ts                        # 4-locale dictionary
│   └── legal/                                  # Inlined HTML for impressum/etc.
├── i18n/                                       # next-intl plumbing
├── lib/seo.ts                                  # SITE constants + JSON-LD
└── messages/{de,en,ru,tr}.json                 # i18n strings
```
