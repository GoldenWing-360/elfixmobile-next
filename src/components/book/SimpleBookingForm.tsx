"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Check, Store, Truck, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import { repairLabel } from "@/data/repair-labels";

/**
 * Replaces the previous 6-step BookingFlow (service-picker -> device ->
 * damage -> pickup -> date -> contact -> success). Senior-audit feedback:
 * multi-step is good for SaaS onboarding, terrible for "my display is
 * cracked, help". Most repair customers want one form, four lines, done.
 *
 * Required fields collapsed to the actual data we need:
 *   - Name + phone (we'll call back)
 *   - Device + damage description
 *   - Service preference (walk-in / pickup / mail)
 *
 * Email + preferred-time are optional. URL parameters from the calculator
 * (?model=, ?repairs=, ?total=, ?service=) pre-fill the form so the
 * "from calculator" handoff still works. Photo upload is deferred until
 * an R2 bucket is bound; the description textarea takes its place.
 *
 * The API contract stays the same (POST /api/lead with type:"booking"),
 * so the existing email + KV-persist + status-URL flow is untouched.
 */

type Service = "walkin" | "pickup" | "send";

const schema = z.object({
  name: z.string().min(2, "name"),
  phone: z.string().min(6, "phone"),
  email: z.string().email("email").or(z.literal("")).optional(),
  device: z.string().min(2, "device"),
  damage: z.string().min(5, "damage"),
  service: z.enum(["walkin", "pickup", "send"]),
  date: z.string().optional(),
  agb: z.literal(true, { message: "agb" }),
});

type FormData = z.infer<typeof schema>;

const SERVICE_ICONS: Record<Service, typeof Store> = {
  walkin: Store,
  pickup: Truck,
  send: Mail,
};

export function SimpleBookingForm() {
  const t = useTranslations("booking_form");
  const locale = useLocale() as "de" | "en" | "ru" | "tr";
  const params = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadToken, setLeadToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const presetDevice =
    params.get("model") || params.get("device") || "";
  // Map calc-slugs like "display,battery" to a sentence the customer
  // can read and edit, instead of dumping the raw slug into the field.
  // "display" -> "Display Komplett defekt - " (locale-aware) reads like
  // a starter for the actual description.
  const presetDamage = useMemo(() => {
    const raw = params.get("repairs");
    if (!raw) return "";
    const labels = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((slug) => repairLabel(slug, locale));
    if (labels.length === 0) return "";
    return labels.join(", ") + " - ";
  }, [params, locale]);
  const presetService =
    (params.get("service") as Service | null) || "walkin";

  const serviceOptions: { value: Service; label: string; sub: string }[] = [
    { value: "walkin", label: t("service_walkin_label"), sub: t("service_walkin_sub") },
    { value: "pickup", label: t("service_pickup_label"), sub: t("service_pickup_sub") },
    { value: "send", label: t("service_send_label"), sub: t("service_send_sub") },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      service: presetService,
      device: presetDevice,
      damage: presetDamage,
    },
  });

  // Bind the service radio group to a single watched field so the visual
  // tile selection mirrors form state.
  const service = watch("service");

  useEffect(() => {
    if (presetDevice) setValue("device", presetDevice, { shouldValidate: true });
    if (presetDamage) setValue("damage", presetDamage, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "booking",
        _hp: honeypot,
        service: data.service,
        device: data.device,
        damage: data.damage,
        date: data.date || "",
        agb: data.agb,
        contact: {
          name: data.name,
          email: data.email || "no-email-provided@example.com",
          phone: data.phone,
          message: "",
        },
      }),
    });
    if (!res.ok) {
      setSubmitError(t("err_send_failed"));
      return;
    }
    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      token?: string;
    };
    if (body.id) setLeadId(body.id);
    if (body.token) setLeadToken(body.token);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8 md:py-36">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-success)] text-white"
          >
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-8 t-h2">
            {t("success_h1")}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-[1.55] text-[#525257]">
            {t("success_sub")}
          </p>

          {leadId && (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/[0.06] bg-white p-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
                {t("success_order_id_label")}
              </div>
              <div className="mt-1 font-mono text-[13px] text-[#1d1d1f]">
                {leadId.slice(0, 8)}…
              </div>
              <Link
                href={`/status/${leadId}${leadToken ? `?t=${leadToken}` : ""}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-accent)] hover:underline"
              >
                {t("success_status_link")} →
              </Link>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="tel:+436606071414"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-text-dark)] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
            >
              +43 660 6071414
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3 text-[15px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04]"
            >
              {t("success_back_home")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Honeypot - hidden from humans, populated only by naive bots. */}
          <div className="hidden" aria-hidden="true">
            <label>
              {t("honeypot_label")}
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

          {/* Service-picker as visual tiles. Default walk-in for low-friction
           * start; user can switch with one tap. */}
          <fieldset>
            <legend className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
              {t("service_legend")}
            </legend>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {serviceOptions.map((opt) => {
                const Icon = SERVICE_ICONS[opt.value];
                const active = service === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "group cursor-pointer rounded-2xl border p-5 transition-all",
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.04] ring-2 ring-[var(--color-accent)]/30"
                        : "border-black/[0.08] bg-white hover:border-black/[0.18]",
                    )}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register("service")}
                      className="sr-only"
                    />
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-[var(--color-accent)]" : "text-[#1d1d1f]",
                      )}
                      strokeWidth={1.5}
                    />
                    <div className="mt-4 text-[15px] font-semibold tracking-[-0.005em]">
                      {opt.label}
                    </div>
                    <div className="mt-1 text-[12.5px] text-[#525257]">
                      {opt.sub}
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field label={t("field_device")} error={errors.device && t("err_min_2")}>
            <input
              {...register("device")}
              placeholder={t("field_device_ph")}
              className={inputCls}
              autoComplete="off"
            />
          </Field>

          <Field label={t("field_damage")} error={errors.damage && t("err_min_5")}>
            <textarea
              {...register("damage")}
              rows={4}
              placeholder={t("field_damage_ph")}
              className={cn(inputCls, "resize-none")}
            />
          </Field>

          <Field label={t("field_date")}>
            <div className="flex items-center gap-2 rounded-2xl border border-black/[0.1] bg-white px-4 py-3">
              <Clock className="h-4 w-4 text-[#86868B]" />
              <input
                type="datetime-local"
                {...register("date")}
                className="w-full bg-transparent text-[15px] outline-none"
              />
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={t("field_name")} error={errors.name && t("err_required")}>
              <input
                {...register("name")}
                className={inputCls}
                autoComplete="name"
              />
            </Field>
            <Field label={t("field_phone")} error={errors.phone && t("err_required")}>
              <input
                {...register("phone")}
                className={inputCls}
                autoComplete="tel"
                placeholder={t("field_phone_ph")}
              />
            </Field>
          </div>

          <Field label={t("field_email")} error={errors.email && t("err_email_invalid")}>
            <input
              type="email"
              {...register("email")}
              className={inputCls}
              autoComplete="email"
              placeholder={t("field_email_ph")}
            />
          </Field>

          {/* AGB-checkbox is required by AT consumer law for booking
            * forms. Kept as a single line, not in its own card. */}
          <label className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#525257]">
            <input
              type="checkbox"
              required
              {...register("agb")}
              className="mt-0.5 h-4 w-4 rounded border-black/30"
            />
            <span>
              {t("agb_prefix")}
              <Link href="/agb" className="underline hover:text-[var(--color-accent)]">
                {t("agb_link_agb")}
              </Link>
              {t("agb_and")}
              <Link
                href="/datenschutz"
                className="underline hover:text-[var(--color-accent)]"
              >
                {t("agb_link_dsgvo")}
              </Link>
              {t("agb_suffix")}
            </span>
          </label>
          {errors.agb && (
            <p className="text-[12.5px] text-red-600">{t("err_agb_required")}</p>
          )}

          {submitError && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-4 text-[14px] text-red-700">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn(
              "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[16px] font-medium transition-colors",
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

          <p className="text-center text-[13px] text-[#86868B]">
            {t("footer_note")}
          </p>
        </form>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

function Field({
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
