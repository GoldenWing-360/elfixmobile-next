"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { Button } from "@/components/Button";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Maria-Tusch-Strasse+17%2F1%2C+1220+Wien";

// Plain Google Maps embed (no API key needed). Lazy-loaded by the browser
// via loading="lazy" so it doesn't block the rest of the section.
const MAPS_EMBED =
  "https://www.google.com/maps?q=Maria-Tusch-Strasse+17%2F1%2C+1220+Wien&hl=de&z=15&output=embed";

export function Location() {
  const t = useTranslations("location");
  const tc = useTranslations("common");

  return (
    <section id="location" className="relative bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          {/* Left: copy + facts */}
          <motion.header
            initial={{ opacity: 0.999, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5"
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
              {t("headline")}
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-white/65">
              {t("sub")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={MAPS_URL} variant="primary" size="lg" magnetic>
                {t("directions_cta")}
              </Button>
              <Button href={`tel:${t("phone").replace(/\s/g, "")}`} variant="secondary" size="lg">
                <Phone className="h-4 w-4" />
                {t("call_cta")}
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-7 text-[15px] sm:grid-cols-2">
              <Fact icon={<MapPin className="h-4 w-4" />} label={tc("address_label")}>
                {t("address_line_1")}
                <br />
                {t("address_line_2")}
              </Fact>
              <Fact icon={<Phone className="h-4 w-4" />} label={t("phone_label")}>
                <a className="hover:text-white" href={`tel:${t("phone").replace(/\s/g, "")}`}>
                  {t("phone")}
                </a>
              </Fact>
              <Fact icon={<Mail className="h-4 w-4" />} label={t("email_label")}>
                <a className="hover:text-white" href={`mailto:${t("email")}`}>
                  {t("email")}
                </a>
              </Fact>
              <Fact icon={<Clock className="h-4 w-4" />} label={t("hours_label")}>
                {t("hours_mo_sa")}
                <br />
                {t("hours_so")}
              </Fact>
            </div>
          </motion.header>

          {/* Right: actual interactive map of the shop location.
            * The previous full-bleed Unsplash sunset photo was abstract and
            * confusing — visitors asked "what is this?" Replacing it with the
            * real Google Maps embed answers the implicit user question
            * ("where exactly are you?") in one glance. */}
          <motion.div
            initial={{ opacity: 0.999, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/[0.06]">
              <iframe
                src={MAPS_EMBED}
                title="EL Fix Mobile - Maria-Tusch-Strasse 17/1, 1220 Wien"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="aspect-[4/5] w-full sm:aspect-[5/4] md:aspect-[3/4]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
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
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
        <span className="text-[var(--color-accent)]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-[15.5px] leading-[1.6] text-white/85">{children}</div>
    </div>
  );
}
