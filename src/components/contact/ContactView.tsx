import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Clock, MessageCircle, Truck } from "lucide-react";

/**
 * Contact page — info-only, no form. Decision: customers reach the shop
 * via the three explicit channels (call, WhatsApp, walk-in) plus email.
 * Form-on-contact-page was a generic SaaS reflex; a repair shop wants
 * the customer on the phone or in WhatsApp where reply latency is real.
 *
 * Six stacked sections on the light page surface:
 *   1. Page header
 *   2. Three quick-action tiles (Anrufen / WhatsApp / Walk-in)
 *   3. Ansprechperson row
 *   4. Map
 *   5. 4-up facts grid (address, email, hours, pickup)
 *   6. closing line + final CTA back to /buchen
 */

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Maria-Tusch-Strasse+17%2F1%2C+1220+Wien";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Maria-Tusch-Strasse+17%2F1%2C+1220+Wien&hl=de&z=15&output=embed";
const WA_URL = "https://wa.me/436606071414";
const PHONE = "+436606071414";

export function ContactView() {
  const t = useTranslations("contact");
  const tl = useTranslations("location");
  const tp = useTranslations("pickup");
  const tc = useTranslations("common");

  return (
    <div className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      {/* 1. Page header */}
      <section className="mx-auto max-w-5xl px-6 pt-24 md:px-8 md:pt-32">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 t-h1">
          {t("headline")}
        </h1>
        <p className="mt-6 max-w-2xl text-[18px] leading-[1.55] text-[#525257]">
          {t("sub")}
        </p>
      </section>

      {/* 2. Three quick-action tiles */}
      <section className="mx-auto max-w-5xl px-6 pt-16 md:px-8 md:pt-20">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href={`tel:${PHONE}`}
            className="group rounded-2xl border border-black/[0.06] bg-white p-6 transition-colors hover:bg-black/[0.02]"
          >
            <Phone className="h-5 w-5 text-[var(--color-accent)]" />
            <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
              Anrufen
            </div>
            <div className="mt-1 text-[17px] font-semibold tracking-[-0.005em]">
              {tl("phone")}
            </div>
          </a>
          <a
            href={WA_URL}
            className="group rounded-2xl border border-black/[0.06] bg-white p-6 transition-colors hover:bg-black/[0.02]"
          >
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
              WhatsApp
            </div>
            <div className="mt-1 text-[17px] font-semibold tracking-[-0.005em]">
              Schreiben
            </div>
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-black/[0.06] bg-white p-6 transition-colors hover:bg-black/[0.02]"
          >
            <MapPin className="h-5 w-5 text-[var(--color-accent)]" />
            <div className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
              Walk-in
            </div>
            <div className="mt-1 text-[17px] font-semibold tracking-[-0.005em]">
              Aspern Seestadt
            </div>
          </a>
        </div>
      </section>

      {/* 3. Ansprechperson */}
      <section className="mx-auto max-w-5xl px-6 pt-16 md:px-8 md:pt-24">
        <div className="flex items-center gap-5">
          <div
            aria-hidden
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--color-text-dark)] text-[16px] font-semibold tracking-tight text-white"
          >
            NR
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
              Deine Ansprechperson
            </div>
            <div className="mt-0.5 text-[17px] font-semibold tracking-[-0.005em]">
              Natalja Rahimova
            </div>
            <div className="text-[14px] text-[#525257]">
              Inhaberin · Antwort meist innerhalb 30 Minuten
            </div>
          </div>
        </div>
      </section>

      {/* 4. Map */}
      <section className="mx-auto max-w-5xl px-6 pt-16 md:px-8 md:pt-24">
        <div className="overflow-hidden rounded-3xl ring-1 ring-black/[0.06]">
          <iframe
            src={MAPS_EMBED}
            title="EL Fix Mobile — Maria-Tusch-Strasse 17/1, 1220 Wien"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]"
          />
        </div>
      </section>

      {/* 5. Facts grid */}
      <section className="mx-auto max-w-5xl px-6 pt-16 md:px-8 md:pt-24">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={<MapPin className="h-4 w-4" />} label={tc("address_label")}>
            {tl("address_line_1")}
            <br />
            {tl("address_line_2")}
          </Fact>
          <Fact icon={<Mail className="h-4 w-4" />} label={tl("email_label")}>
            <a href={`mailto:${tl("email")}`} className="hover:text-[var(--color-accent)]">
              {tl("email")}
            </a>
          </Fact>
          <Fact icon={<Clock className="h-4 w-4" />} label={tl("hours_label")}>
            {tl("hours_mo_sa")}
            <br />
            {tl("hours_so")}
          </Fact>
          <Fact icon={<Truck className="h-4 w-4" />} label={tp("title")}>
            {tp("sub")}
            <Link
              href={{ pathname: "/buchen", query: { service: "pickup" } }}
              className="mt-1 inline-flex items-center gap-1 text-[14px] text-[var(--color-accent)] hover:underline"
            >
              {tp("pill")} →
            </Link>
          </Fact>
        </div>
      </section>

      {/* 6. Closing CTA back to booking flow for users who decided to
        * commit to a repair while reading the contact page. Single
        * sentence + a primary action, nothing else. */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8 md:py-36">
        <h2 className="t-h3">
          Schon bereit für die Reparatur?
        </h2>
        <Link
          href="/buchen"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Termin buchen <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#6e6e73]">
        <span className="text-[var(--color-accent)]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-[15px] leading-[1.55] text-[#1d1d1f]">{children}</div>
    </div>
  );
}
