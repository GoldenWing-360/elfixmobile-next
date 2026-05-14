"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Check, Store, Truck, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

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
 * Email + Wunschtermin are optional. URL parameters from the calculator
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

const SERVICE_OPTIONS: { value: Service; icon: typeof Store; label: string; sub: string }[] = [
  {
    value: "walkin",
    icon: Store,
    label: "Vorbeikommen",
    sub: "Maria-Tusch-Strasse 17/1, Mo–Sa 9–19",
  },
  {
    value: "pickup",
    icon: Truck,
    label: "Wir holen ab",
    sub: "Gratis in Wien ab €70 Reparaturwert",
  },
  {
    value: "send",
    icon: Mail,
    label: "Per Post schicken",
    sub: "Versicherter Versand, österreichweit",
  },
];

export function SimpleBookingForm() {
  const params = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadToken, setLeadToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const presetDevice =
    params.get("model") || params.get("device") || "";
  const presetDamage = params.get("repairs")
    ? params.get("repairs")!.split(",").join(", ")
    : "";
  const presetService =
    (params.get("service") as Service | null) || "walkin";

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
        contact: {
          name: data.name,
          email: data.email || "no-email-provided@example.com",
          phone: data.phone,
          message: "",
        },
      }),
    });
    if (!res.ok) {
      setSubmitError(
        "Senden hat nicht geklappt. Bitte direkt anrufen: +43 660 6071414",
      );
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
        <div className="mx-auto max-w-3xl px-6 py-32 text-center md:px-8 md:py-40">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-success)] text-white"
          >
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-8 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.025em]">
            Anfrage eingegangen.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[16.5px] leading-[1.55] text-[#525257]">
            Wir melden uns innerhalb 30 Minuten zurück mit Bestätigung und
            Festpreis. Falls dringend: ruf direkt an.
          </p>

          {leadId && (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/[0.06] bg-white p-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
                Auftrags-ID
              </div>
              <div className="mt-1 font-mono text-[13px] text-[#1d1d1f]">
                {leadId.slice(0, 8)}…
              </div>
              <a
                href={`/de/status/${leadId}${leadToken ? `?t=${leadToken}` : ""}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--color-accent)] hover:underline"
              >
                Status live verfolgen →
              </a>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="tel:+436606071414"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-text-dark)] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-black"
            >
              +43 660 6071414
            </a>
            <a
              href="/de"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3 text-[14.5px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04]"
            >
              Zur Startseite
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Honeypot — hidden from humans, populated only by naive bots. */}
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

          {/* Service-picker as visual tiles. Default walk-in for low-friction
           * start; user can switch with one tap. */}
          <fieldset>
            <legend className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
              Wie kommt das Gerät zu uns?
            </legend>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SERVICE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
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
                    <div className="mt-4 text-[14.5px] font-semibold tracking-[-0.005em]">
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

          {/* Device + damage in one block — these are the two questions
            * that actually matter for a quote. */}
          <Field label="Gerät" error={errors.device && "Mindestens 2 Zeichen"}>
            <input
              {...register("device")}
              placeholder="z.B. iPhone 14 Pro, Samsung S23, MacBook Air"
              className={inputCls}
              autoComplete="off"
            />
          </Field>

          <Field label="Was ist passiert?" error={errors.damage && "Mindestens 5 Zeichen"}>
            <textarea
              {...register("damage")}
              rows={4}
              placeholder="Kurze Beschreibung: Display gesprungen, Akku schwach, Wasserschaden …"
              className={cn(inputCls, "resize-none")}
            />
          </Field>

          {/* Optional Wunschtermin */}
          <Field label="Wunschtermin (optional)">
            <div className="flex items-center gap-2 rounded-2xl border border-black/[0.1] bg-white px-4 py-3">
              <Clock className="h-4 w-4 text-[#86868B]" />
              <input
                type="datetime-local"
                {...register("date")}
                className="w-full bg-transparent text-[15px] outline-none"
              />
            </div>
          </Field>

          {/* Contact details — name + phone required. Email optional;
            * we send a confirmation if provided but the call back happens
            * via phone in 30 min regardless. */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Dein Name" error={errors.name && "Pflichtfeld"}>
              <input
                {...register("name")}
                className={inputCls}
                autoComplete="name"
              />
            </Field>
            <Field label="Telefon" error={errors.phone && "Pflichtfeld"}>
              <input
                {...register("phone")}
                className={inputCls}
                autoComplete="tel"
                placeholder="+43 …"
              />
            </Field>
          </div>

          <Field label="E-Mail (optional)" error={errors.email && "Ungültige E-Mail"}>
            <input
              type="email"
              {...register("email")}
              className={inputCls}
              autoComplete="email"
              placeholder="für die Bestätigungs-Mail"
            />
          </Field>

          {/* AGB-checkbox is required by AT consumer law for booking
            * forms. Kept as a single line, not in its own card. */}
          <label className="flex items-start gap-3 text-[13.5px] leading-[1.5] text-[#525257]">
            <input
              type="checkbox"
              {...register("agb")}
              className="mt-0.5 h-4 w-4 rounded border-black/30"
            />
            <span>
              Ich akzeptiere die{" "}
              <a
                href="/de/agb"
                className="underline hover:text-[var(--color-accent)]"
              >
                AGB
              </a>{" "}
              und die{" "}
              <a
                href="/de/datenschutz"
                className="underline hover:text-[var(--color-accent)]"
              >
                Datenschutzerklärung
              </a>
              .
            </span>
          </label>
          {errors.agb && (
            <p className="text-[12.5px] text-red-600">Bitte AGB bestätigen.</p>
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
            Reparatur anfragen
          </button>

          <p className="text-center text-[13px] text-[#86868B]">
            Wir melden uns innerhalb 30 Minuten mit Bestätigung und Festpreis.
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
