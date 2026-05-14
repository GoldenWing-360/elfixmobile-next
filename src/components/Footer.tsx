import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/seo";

export function Footer() {
  const t = useTranslations("footer");
  const fl = useTranslations("footer_links");
  const year = new Date().getFullYear();

  // Link to the dedicated SEO service & brand pages instead of pre-filtered
  // /preisrechner queries. The hub pages own the content, the calculator
  // is one step deeper in the funnel.
  const cols = [
    {
      heading: t("services"),
      links: [
        { href: "/display-reparatur-wien", label: fl("display") },
        { href: "/akku-tausch-wien", label: fl("battery") },
        { href: "/wasserschaden-handy-reparatur-wien", label: fl("water") },
        { href: "/datenrettung-handy-wien", label: fl("camera") },
      ],
    },
    {
      heading: t("brands"),
      links: [
        { href: "/reparatur/apple", label: fl("iphone") },
        { href: "/reparatur/samsung", label: fl("samsung") },
        { href: "/reparatur/xiaomi", label: fl("xiaomi") },
        { href: "/reparatur/google", label: fl("google_pixel") },
      ],
    },
    {
      heading: t("company"),
      links: [
        { href: "/ueber-uns", label: "Über uns" },
        { href: "/bewertungen", label: "Bewertungen" },
        { href: "/faq", label: "FAQ" },
        { href: "/kontakt", label: fl("contact") },
      ],
    },
    {
      heading: t("legal"),
      links: [
        { href: "/impressum", label: fl("impressum") },
        { href: "/datenschutz", label: fl("privacy") },
        { href: "/agb", label: fl("terms") },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-black text-white/75">
      {/* pb-32 on mobile leaves room for the fixed StickyMobileCTA (~64px +
       * iOS safe-area). On desktop the sticky bar is hidden, so we revert
       * to a normal py-20. */}
      <div className="mx-auto max-w-7xl px-6 pb-32 pt-20 md:px-8 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Image
              src="/logo-light.svg"
              alt="EL Fix Mobile"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/55">
              {t("tagline")}
            </p>
            <address className="mt-6 not-italic text-[14px] leading-relaxed text-white/65">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {t("address_label")}
              </div>
              Maria-Tusch-Strasse 17/1
              <br />
              1220 Wien (Aspern Seestadt)
              <br />
              <a href="tel:+436606071414" className="hover:text-white">
                +43 660 6071414
              </a>
            </address>
            <div className="mt-6 text-[14px] leading-relaxed text-white/65">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {t("hours_label")}
              </div>
              {t("hours_mo_sa")}
              <br />
              {t("hours_so")}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.heading}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {c.heading}
              </div>
              <ul className="mt-4 space-y-3 text-[14px]">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/65 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-[12px] text-white/40 md:flex-row md:items-center">
          <p>
            © {year} {t("copyright")}
          </p>
          {/* Legal line: the previous "FN unter Magistrat Wien" was incorrect —
           * an e.U. is registered at the Firmenbuch (Handelsgericht), not the
           * Magistrat. Magistrat-Donaustadt is only the Gewerbeaufsicht. */}
          <p className="text-center md:text-right">
            {SITE.legalName} · UID {SITE.vatId} · {SITE.commercialRegister}
            <span className="mx-2 text-white/20">·</span>
            <a
              href="https://goldenwing.at"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              Webdesign von GoldenWing
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
