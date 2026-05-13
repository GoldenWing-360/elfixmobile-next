import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: t("services"),
      links: [
        { href: "/services", label: "Display Reparatur" },
        { href: "/services", label: "Akku Tausch" },
        { href: "/services", label: "Wasserschaden" },
        { href: "/services", label: "Kamera Reparatur" },
      ],
    },
    {
      heading: t("brands"),
      links: [
        { href: "/services", label: "iPhone" },
        { href: "/services", label: "Samsung" },
        { href: "/services", label: "Xiaomi" },
        { href: "/services", label: "Google Pixel" },
      ],
    },
    {
      heading: t("company"),
      links: [
        { href: "/kontakt", label: "Kontakt" },
        { href: "/buchen", label: "Termin buchen" },
        { href: "/preisrechner", label: "Preisrechner" },
      ],
    },
    {
      heading: t("legal"),
      links: [
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Datenschutz" },
        { href: "/agb", label: "AGB" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-black text-white/75">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 font-semibold tracking-tight text-white">
              <span
                aria-hidden
                className="grid h-7 w-7 place-items-center rounded-[8px] bg-white text-[12px] font-bold text-black"
              >
                EL
              </span>
              <span className="text-[15px]">FIX MOBILE</span>
            </div>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/55">
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
          <p>EL Fix Mobile e.U. · FN unter Magistrat Wien</p>
        </div>
      </div>
    </footer>
  );
}
