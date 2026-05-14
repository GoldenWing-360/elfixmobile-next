"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin, Clock, MessageCircle, Check, Truck } from "lucide-react";
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

/**
 * Contact page — stacked Apple-style. Each module is its own quiet
 * section on the light page surface with generous vertical breathing
 * room. No dark gradient hero, no card-in-card nesting; the only
 * elevated card on the page is the form, because the form IS the
 * primary action.
 *
 * Section order top to bottom:
 *   1. Page header (eyebrow + H1 + sub) — text only, light bg
 *   2. Three quick-action tiles (Call, WhatsApp, Walk-in)
 *   3. Ansprechperson row — single horizontal block
 *   4. Map (full-width landscape)
 *   5. 4-up facts grid (address, email, hours, pickup)
 *   6. Form, centered, the only elevated card
 */
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
    <div className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      {/* 1. Page header — text only, no container */}
      <section className="mx-auto max-w-5xl px-6 pt-24 md:px-8 md:pt-32">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
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

      {/* 3. Ansprechperson — single line, quiet */}
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
            <div className="text-[13.5px] text-[#525257]">
              Inhaberin · Antwort meist innerhalb 30 Minuten
            </div>
          </div>
        </div>
      </section>

      {/* 4. Map — full-width, generous height */}
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

      {/* 5. Facts grid — 4-up, white tiles on the light surface */}
      <section className="mx-auto max-w-5xl px-6 pt-16 md:px-8 md:pt-24">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          <Fact
            icon={<MapPin className="h-4 w-4" />}
            label={tc("address_label")}
          >
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
            <a
              href="/buchen?service=pickup"
              className="mt-1 inline-flex items-center gap-1 text-[13.5px] text-[var(--color-accent)] hover:underline"
            >
              {tp("pill")} →
            </a>
          </Fact>
        </div>
      </section>

      {/* 6. Form — only elevated card on the page */}
      <section className="mx-auto max-w-3xl px-6 py-24 md:px-8 md:py-32">
        <div className="rounded-3xl bg-white p-7 ring-1 ring-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.18)] md:p-12">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("form_title")}
          </div>
          <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Lieber schreiben.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-[#525257]">
            Antwort meist innerhalb 30 Minuten.
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
              <p className="mt-2 text-[14.5px] text-[#525257]">{t("success_sub")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-5">
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
                <input {...register("name")} className={inputCls} autoComplete="name" />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label={t("field_email")} error={errors.email && te("email")}>
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
              <FormField label={t("field_message")} error={errors.message && te("message")}>
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
      </section>
    </div>
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
      {error && <span className="mt-1 block text-[12px] text-red-600">{error}</span>}
    </label>
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
