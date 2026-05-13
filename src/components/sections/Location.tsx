"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { Button } from "@/components/Button";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Maria-Tusch-Strasse+17%2F1%2C+1220+Wien";

export function Location() {
  const t = useTranslations("location");

  return (
    <section id="location" className="relative bg-black text-white">
      <div className="relative isolate">
        {/* Full-bleed atmospheric image */}
        <div className="relative h-[60svh] w-full md:h-[70svh]">
          <Image
            src="https://images.unsplash.com/photo-1604079628040-94301bb21b91?auto=format&fit=crop&w=2200&q=80"
            alt="Aspern Seestadt Wien bei Dämmerung"
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        {/* Floating contact card */}
        <div className="mx-auto -mt-[200px] max-w-7xl px-6 md:-mt-[280px] md:px-8">
          <motion.div
            initial={{ opacity: 0.999, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0, margin: "200px 0px 200px 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-10 rounded-3xl bg-[var(--color-bg-tertiary)] p-8 ring-1 ring-white/[0.06] md:grid-cols-12 md:gap-8 md:p-12 lg:p-16"
          >
            {/* left */}
            <header className="md:col-span-7">
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
            </header>

            {/* right: facts */}
            <dl className="space-y-7 text-[15px] md:col-span-5">
              <Fact icon={<MapPin className="h-4 w-4" />} label={t("phone_label").replace("Telefon", "Adresse")}>
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
            </dl>
          </motion.div>
        </div>
        <div className="h-24 md:h-32" />
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
      <dt className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
        <span className="text-[var(--color-accent)]">{icon}</span>
        {label}
      </dt>
      <dd className="mt-2 text-[15.5px] leading-[1.6] text-white/85">{children}</dd>
    </div>
  );
}
