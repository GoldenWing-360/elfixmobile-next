"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Check,
  Truck,
  Star,
} from "lucide-react";
import { cn } from "@/lib/cn";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

type FormData = z.infer<typeof schema>;

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
  const te = useTranslations("form_error");
  const tc = useTranslations("common");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });
  const [honeypot, setHoneypot] = useState("");

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        _hp: honeypot,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        message: data.message,
      }),
    });
    if (!res.ok) {
      alert("Sorry — Senden hat nicht geklappt. Bitte direkt anrufen: +43 660 6071414");
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero card: dark-bg container with person + map + headline. The
       * old design was a quiet left-text + right-form 5/7 split that
       * looked like a generic SaaS contact page. The new top card answers
       * three implicit visitor questions in one glance:
       *   - who am I talking to (Ansprechperson + photo placeholder)
       *   - where exactly is the shop (live map)
       *   - how trustworthy (4.4/5 rating chip) */}
      <section className="relative bg-[var(--color-bg-primary)] text-white">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 md:px-8 md:pb-28 md:pt-32">
          <div className="grid grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0a0a0c] via-[#0a1a3a] to-[#001e4d] p-8 md:grid-cols-12 md:gap-10 md:p-12 lg:p-16">
            {/* Left: copy + person */}
            <div className="md:col-span-7">
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
                {t("headline")}
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-[1.55] text-white/70">
                {t("sub")}
              </p>

              {/* Ansprechperson card. Uses an avatar circle with initials
               * as a placeholder until a real team photo is provided. */}
              <div className="mt-9 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div
                  aria-hidden
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#0a1a3a] text-[18px] font-semibold tracking-tight"
                >
                  NR
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                    Deine Ansprechperson
                  </div>
                  <div className="mt-0.5 text-[16px] font-semibold tracking-[-0.005em]">
                    Natalja Rahimova
                  </div>
                  <div className="text-[13px] text-white/65">
                    Inhaberin · meldet sich binnen 30 Minuten
                  </div>
                </div>
              </div>

              {/* Trust chip row */}
              <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-white/80">
                  <Star className="h-3.5 w-3.5 text-[var(--color-success)]" fill="currentColor" />
                  4,4 / 5 · 294 Bewertungen
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-white/80">
                  <Clock className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  Mo–Sa 9–19 · So 9–18
                </span>
              </div>

              {/* Primary actions */}
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`tel:${PHONE}`}
                  className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-[14.5px] font-medium text-black transition-colors hover:bg-white/90"
                >
                  <Phone className="h-4 w-4" />
                  <span>{tl("phone")}</span>
                </a>
                <a
                  href={WA_URL}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#25D366]/30 bg-[#25D366]/[0.12] px-5 py-3 text-[14.5px] font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/[0.18]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right: live map embed.
              * Wrapped in a rounded card with subtle ring so it reads as a
              * design element, not a raw 3rd-party widget. */}
            <div className="md:col-span-5">
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl ring-1 ring-white/10">
                <iframe
                  src={MAPS_EMBED}
                  title="EL Fix Mobile — Maria-Tusch-Strasse 17/1, 1220 Wien"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--color-accent)] hover:underline"
              >
                {tl("directions_cta")} <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Facts grid (4-up): Adresse · E-Mail · Öffnungszeiten · Abholung.
        * Replaces the previous stacked column of FactBlocks that pushed the
        * form way down on tall screens. */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <FactBlock
              icon={<MapPin className="h-4 w-4" />}
              label={tc("address_label")}
            >
              {tl("address_line_1")}
              <br />
              {tl("address_line_2")}
            </FactBlock>
            <FactBlock icon={<Mail className="h-4 w-4" />} label={tl("email_label")}>
              <a
                href={`mailto:${tl("email")}`}
                className="hover:text-[var(--color-accent)]"
              >
                {tl("email")}
              </a>
            </FactBlock>
            <FactBlock icon={<Clock className="h-4 w-4" />} label={tl("hours_label")}>
              {tl("hours_mo_sa")}
              <br />
              {tl("hours_so")}
            </FactBlock>
            <FactBlock icon={<Truck className="h-4 w-4" />} label={tp("title")}>
              {tp("sub")}
              <a
                href="/buchen?service=pickup"
                className="mt-1 inline-flex items-center gap-1 text-[13.5px] text-[var(--color-accent)] hover:underline"
              >
                {tp("pill")} →
              </a>
            </FactBlock>
          </div>
        </div>
      </section>

      {/* Form section — full-width centered card with the form as the
        * single primary action. */}
      <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
        <div className="mx-auto max-w-3xl px-6 pb-24 md:px-8 md:pb-32">
          <div className="rounded-3xl bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04] md:p-12">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {t("form_title")}
            </div>
            <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
              Sag uns kurz, worum es geht.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-[#525257]">
              Wir melden uns innerhalb 30 Minuten zurück. Antwort meist per
              Telefon oder WhatsApp.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-col items-center text-center"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-success)] text-white">
                  <Check className="h-6 w-6" strokeWidth={2.5} />
                </span>
                <h3 className="mt-5 text-[24px] font-semibold tracking-[-0.015em]">
                  {t("success_title")}
                </h3>
                <p className="mt-2 text-[14.5px] text-[#525257]">
                  {t("success_sub")}
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 grid grid-cols-1 gap-5"
              >
                <div className="hidden" aria-hidden="true">
                  <label>
                    Leave this empty
                    <input
                      type="text"
                      name="_hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>
                <FormField label={t("field_name")} error={errors.name && te("name")}>
                  <input
                    {...register("name")}
                    className={inputCls}
                    autoComplete="name"
                  />
                </FormField>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label={t("field_email")}
                    error={errors.email && te("email")}
                  >
                    <input
                      type="email"
                      {...register("email")}
                      className={inputCls}
                      autoComplete="email"
                    />
                  </FormField>
                  <FormField label={t("field_phone")}>
                    <input
                      type="tel"
                      {...register("phone")}
                      className={inputCls}
                      autoComplete="tel"
                    />
                  </FormField>
                </div>
                <FormField
                  label={t("field_message")}
                  error={errors.message && te("message")}
                >
                  <textarea
                    rows={5}
                    {...register("message")}
                    placeholder={t("field_message_ph")}
                    className={cn(inputCls, "resize-none")}
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors",
                    isValid && !isSubmitting
                      ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                      : "cursor-not-allowed bg-black/[0.06] text-[#6e6e73]",
                  )}
                >
                  {isSubmitting && (
                    <span
                      aria-hidden
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                    />
                  )}
                  {t("submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && (
        <span className="mt-1 block text-[12px] text-red-600">{error}</span>
      )}
    </label>
  );
}

function FactBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.06] bg-white p-6">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#6e6e73]">
        <span className="text-[var(--color-accent)]">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-[15px] leading-[1.55] text-[#1d1d1f]">
        {children}
      </div>
    </div>
  );
}
