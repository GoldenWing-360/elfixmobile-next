"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin, Clock, MessageCircle, Check, Truck } from "lucide-react";
import { Button } from "@/components/Button";
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
const WA_URL = "https://wa.me/436606071414";
const PHONE = "+436606071414";

export function ContactView() {
  const t = useTranslations("contact");
  const tl = useTranslations("location");
  const tp = useTranslations("pickup");
  const te = useTranslations("form_error");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
        <header className="max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {t("headline")}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.55] text-[#525257]">{t("sub")}</p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-12 md:gap-12 lg:gap-16">
          {/* Left: info */}
          <div className="space-y-8 md:col-span-5">
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_30px_-16px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04]">
              <div className="grid grid-cols-2 gap-3 p-6">
                <a
                  href={`tel:${PHONE}`}
                  className="group flex flex-col items-start gap-3 rounded-2xl bg-black p-5 text-white transition-transform hover:-translate-y-0.5"
                >
                  <Phone className="h-5 w-5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] opacity-60">
                      {tl("phone_label")}
                    </div>
                    <div className="mt-1 text-[16px] font-semibold tracking-[-0.005em]">
                      {tl("phone")}
                    </div>
                  </div>
                </a>
                <a
                  href={WA_URL}
                  className="group flex flex-col items-start gap-3 rounded-2xl bg-[#25D366] p-5 text-white transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">
                      WhatsApp
                    </div>
                    <div className="mt-1 text-[16px] font-semibold tracking-[-0.005em]">
                      Schreiben
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="space-y-7 text-[15px]">
              <FactBlock
                icon={<MapPin className="h-4 w-4" />}
                label="Adresse"
                cta={{ href: MAPS_URL, label: tl("directions_cta") }}
              >
                {tl("address_line_1")}
                <br />
                {tl("address_line_2")}
              </FactBlock>
              <FactBlock icon={<Mail className="h-4 w-4" />} label={tl("email_label")}>
                <a href={`mailto:${tl("email")}`} className="hover:text-[var(--color-accent)]">
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
                <div className="mt-2">
                  <Button href="/buchen?service=pickup" variant="tertiary">
                    {tp("pill")}
                  </Button>
                </div>
              </FactBlock>
            </div>
          </div>

          {/* Right: form */}
          <div className="md:col-span-7">
            <div className="rounded-3xl bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04] md:p-10">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {t("form_title")}
              </div>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 flex flex-col items-center text-center"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-success)] text-white">
                    <Check className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                  <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.015em]">
                    {t("success_title")}
                  </h2>
                  <p className="mt-2 text-[14.5px] text-[#525257]">{t("success_sub")}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-5">
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
                      "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all",
                      isValid && !isSubmitting
                        ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:scale-[1.02]"
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
        </div>
      </div>
    </section>
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

function FactBlock({
  icon,
  label,
  children,
  cta,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  cta?: { href: string; label: string };
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#6e6e73]">
        <span className="text-[var(--color-accent)]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-[15.5px] leading-[1.6] text-[#1d1d1f]">{children}</div>
      {cta && (
        <a href={cta.href} className="mt-1 inline-flex items-center gap-1 text-[14px] text-[var(--color-accent)] hover:underline">
          {cta.label} →
        </a>
      )}
    </div>
  );
}
