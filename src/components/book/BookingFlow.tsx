"use client";

import { useReducer, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronLeft, Store, Truck, Mail, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type ServiceType = "walkin" | "pickup" | "send";

type State = {
  step: 0 | 1 | 2 | 3 | 4 | 5;
  service: ServiceType | null;
  device: string;
  damage: string;
  pickup: { address: string; floor: string; when: "morning" | "afternoon" | "evening" | null };
  date: string;
  contact: { name: string; email: string; phone: string; message: string; agb: boolean };
  total: number | null;
};

type Action =
  | { type: "set_service"; value: ServiceType }
  | { type: "set_device"; value: string }
  | { type: "set_damage"; value: string }
  | { type: "set_pickup_address"; value: string }
  | { type: "set_pickup_floor"; value: string }
  | { type: "set_pickup_when"; value: State["pickup"]["when"] }
  | { type: "set_date"; value: string }
  | { type: "set_contact"; value: Partial<State["contact"]> }
  | { type: "set_total"; value: number }
  | { type: "set_step"; value: State["step"] }
  | { type: "back" }
  | { type: "next" };

const initial: State = {
  step: 0,
  service: null,
  device: "",
  damage: "",
  pickup: { address: "", floor: "", when: null },
  date: "",
  contact: { name: "", email: "", phone: "", message: "", agb: false },
  total: null,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "set_service":
      return { ...s, service: a.value };
    case "set_device":
      return { ...s, device: a.value };
    case "set_damage":
      return { ...s, damage: a.value };
    case "set_pickup_address":
      return { ...s, pickup: { ...s.pickup, address: a.value } };
    case "set_pickup_floor":
      return { ...s, pickup: { ...s.pickup, floor: a.value } };
    case "set_pickup_when":
      return { ...s, pickup: { ...s.pickup, when: a.value } };
    case "set_date":
      return { ...s, date: a.value };
    case "set_contact":
      return { ...s, contact: { ...s.contact, ...a.value } };
    case "set_total":
      return { ...s, total: a.value };
    case "set_step":
      return { ...s, step: a.value };
    case "back":
      return { ...s, step: Math.max(0, s.step - 1) as State["step"] };
    case "next":
      return { ...s, step: Math.min(5, s.step + 1) as State["step"] };
  }
}

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  message: z.string().optional(),
  agb: z.literal(true),
});

export function BookingFlow() {
  const t = useTranslations("book");
  const tr = useTranslations("repair_label");
  const [state, dispatch] = useReducer(reducer, initial);
  const params = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  // Server-returned lead id is shown in the success card so the customer
  // can bookmark the /status/<id> page and check progress later.
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadToken, setLeadToken] = useState<string | null>(null);

  // Preload from URL: ?service=pickup&model=iPhone+15&brand=apple-iphone&repairs=display,battery&total=189
  useEffect(() => {
    const svc = params.get("service");
    if (svc === "pickup" || svc === "walkin" || svc === "send")
      dispatch({ type: "set_service", value: svc });

    // Accept both ?model= (from calculator) and ?device= (from brand-gallery)
    const device = params.get("model") || params.get("device");
    if (device) {
      // Use the human-readable name; could be prefixed with brand
      dispatch({ type: "set_device", value: device.replace(/-/g, " ").replace(/\+/g, " ") });
    }

    // Pre-fill the damage textarea from the repairs list (from calc handoff)
    const repairs = params.get("repairs");
    if (repairs) {
      const labels = repairs.split(",").filter(Boolean).map((slug) => {
        try {
          return tr(slug as "display");
        } catch {
          return slug;
        }
      });
      if (labels.length > 0) {
        dispatch({ type: "set_damage", value: labels.join(", ") });
      }
    }

    const total = params.get("total");
    if (total) dispatch({ type: "set_total", value: Number(total) });

    // Jump strategy:
    // - service preset → skip service-tile picker → start at device step
    // - service + device + repairs all preset → skip device step too → go to pickup/date
    if (svc) {
      if (device && repairs) {
        dispatch({ type: "set_step", value: 2 });
      } else {
        dispatch({ type: "set_step", value: 1 });
      }
    } else if (device || repairs) {
      // Calc → Book without explicit service: start at service-pick but pre-fill device/damage
      dispatch({ type: "set_step", value: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Header (eyebrow / H1 / sub) is rendered server-side by the parent page
  // for SSR-SEO reasons; this client tree starts at the Stepper.
  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-4xl px-6 pb-24 md:px-8 md:pb-32">
        <Stepper current={state.step} hasPickup={state.service === "pickup"} />

        <div className="relative mt-10 overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04]">
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div key="ok" {...slide()}>
                <Success
                  onReset={() => setSubmitted(false)}
                  leadId={leadId}
                  leadToken={leadToken}
                />
              </motion.div>
            ) : (
              <>
                {state.step === 0 && (
                  <motion.div key="svc" {...slide()}>
                    <StepService
                      selected={state.service}
                      onPick={(v) => {
                        dispatch({ type: "set_service", value: v });
                        dispatch({ type: "next" });
                      }}
                    />
                  </motion.div>
                )}
                {state.step === 1 && (
                  <motion.div key="dev" {...slide()}>
                    <StepDevice
                      device={state.device}
                      damage={state.damage}
                      onBack={() => dispatch({ type: "back" })}
                      onChange={(d, da) => {
                        dispatch({ type: "set_device", value: d });
                        dispatch({ type: "set_damage", value: da });
                      }}
                      onNext={() => dispatch({ type: "next" })}
                    />
                  </motion.div>
                )}
                {state.step === 2 && state.service === "pickup" && (
                  <motion.div key="pickup" {...slide()}>
                    <StepPickup
                      state={state}
                      dispatch={dispatch}
                      onNext={() => dispatch({ type: "set_step", value: 4 })}
                    />
                  </motion.div>
                )}
                {state.step === 2 && state.service !== "pickup" && (
                  <motion.div key="date" {...slide()}>
                    <StepDate
                      value={state.date}
                      onBack={() => dispatch({ type: "back" })}
                      onChange={(v) => dispatch({ type: "set_date", value: v })}
                      onNext={() => dispatch({ type: "set_step", value: 4 })}
                    />
                  </motion.div>
                )}
                {state.step === 4 && (
                  <motion.div key="contact" {...slide()}>
                    <StepContact
                      state={state}
                      onBack={() => dispatch({ type: "set_step", value: 2 })}
                      onSubmit={async (data) => {
                        dispatch({ type: "set_contact", value: data });
                        const res = await fetch("/api/lead", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "booking",
                            _hp: data._hp,
                            service: state.service,
                            device: state.device,
                            damage: state.damage,
                            pickup: state.pickup,
                            date: state.date,
                            total: state.total,
                            contact: {
                              name: data.name,
                              email: data.email,
                              phone: data.phone || "",
                              message: data.message || "",
                            },
                          }),
                        });
                        if (!res.ok) {
                          // Surface failure to the user instead of silently
                          // showing the success card.
                          alert("Sorry — Senden hat nicht geklappt. Bitte direkt anrufen: +43 660 6071414");
                          return;
                        }
                        const body = await res.json().catch(() => ({}));
                        if (body?.id) setLeadId(body.id);
                        if (body?.token) setLeadToken(body.token);
                        setSubmitted(true);
                      }}
                    />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Stepper({ current, hasPickup }: { current: number; hasPickup: boolean }) {
  const labels = hasPickup
    ? ["Service", "Gerät", "Abholung", "Kontakt"]
    : ["Service", "Gerät", "Termin", "Kontakt"];
  const idxMap = hasPickup ? [0, 1, 2, 4] : [0, 1, 2, 4];
  return (
    <ol className="mt-12 flex items-center justify-center gap-2 text-[12px] text-[#6e6e73]">
      {labels.map((l, i) => {
        const step = idxMap[i];
        const done = current > step;
        const active = current === step;
        return (
          <li key={l} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold transition-colors",
                done
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : active
                    ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-black/15 text-[#6e6e73]",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", active && "font-medium text-[var(--color-text-dark)]")}>{l}</span>
            {i < labels.length - 1 && <span className="mx-1 text-black/15">·</span>}
          </li>
        );
      })}
    </ol>
  );
}

function slide() {
  return {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  };
}

function StepService({
  selected,
  onPick,
}: {
  selected: ServiceType | null;
  onPick: (v: ServiceType) => void;
}) {
  const t = useTranslations("book");
  const opts: { id: ServiceType; Icon: typeof Store; title: string; desc: string; meta: string; recommended?: boolean }[] = [
    {
      id: "walkin",
      Icon: Store,
      title: t("service_walkin_title"),
      desc: t("service_walkin_desc"),
      meta: t("service_walkin_meta"),
    },
    {
      id: "pickup",
      Icon: Truck,
      title: t("service_pickup_title"),
      desc: t("service_pickup_desc"),
      meta: t("service_pickup_meta"),
      recommended: true,
    },
    {
      id: "send",
      Icon: Mail,
      title: t("service_send_title"),
      desc: t("service_send_desc"),
      meta: t("service_send_meta"),
    },
  ];
  return (
    <div className="p-6 md:p-12">
      <h2 className="text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_service_title")}
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-3 md:gap-4">
        {opts.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              aria-pressed={active}
              className={cn(
                "group relative flex items-start gap-5 rounded-2xl border-2 p-5 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:-translate-y-0.5",
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.04]"
                  : "border-black/[0.08] bg-white hover:border-black/20",
              )}
            >
              <span
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors",
                  active ? "bg-[var(--color-accent)] text-white" : "bg-black/[0.05] text-[#1d1d1f]",
                )}
              >
                <o.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-semibold tracking-[-0.005em]">{o.title}</h3>
                  {o.recommended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/[0.15] px-2 py-0.5 text-[11px] font-medium text-[#0e6b32]">
                      <Sparkles className="h-3 w-3" />
                      {o.meta}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[14.5px] leading-[1.5] text-[#525257]">{o.desc}</p>
                {!o.recommended && (
                  <div className="mt-2 text-[12px] text-[#6e6e73]">{o.meta}</div>
                )}
              </div>
              <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function inputCls(extra = "") {
  return cn(
    "w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-[15px] outline-none transition-colors",
    "focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20",
    extra,
  );
}

function StepDevice({
  device,
  damage,
  onChange,
  onBack,
  onNext,
}: {
  device: string;
  damage: string;
  onChange: (d: string, da: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("book");
  const ok = device.trim().length > 1;
  return (
    <div className="p-6 md:p-12">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]">
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_device_title")}
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-5">
        <Field label={t("field_device")}>
          <input
            value={device}
            onChange={(e) => onChange(e.target.value, damage)}
            placeholder={t("field_device_ph")}
            className={inputCls()}
            autoFocus
          />
        </Field>
        <Field label={t("field_damage")}>
          <textarea
            value={damage}
            onChange={(e) => onChange(device, e.target.value)}
            placeholder={t("field_damage_ph")}
            rows={4}
            className={inputCls("resize-none")}
          />
        </Field>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!ok}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all",
            ok
              ? "bg-black text-white hover:scale-[1.02]"
              : "cursor-not-allowed bg-black/[0.06] text-[#6e6e73]",
          )}
        >
          {t("continue")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StepPickup({
  state,
  dispatch,
  onNext,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  onNext: () => void;
}) {
  const t = useTranslations("book");
  const slots: { id: NonNullable<State["pickup"]["when"]>; label: string }[] = [
    { id: "morning", label: t("pickup_when_morning") },
    { id: "afternoon", label: t("pickup_when_afternoon") },
    { id: "evening", label: t("pickup_when_evening") },
  ];
  const ok = state.pickup.address.trim().length > 4 && !!state.pickup.when;

  return (
    <div className="p-6 md:p-12">
      <button type="button" onClick={() => dispatch({ type: "back" })} className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]">
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_pickup_title")}
      </h2>
      <p className="mt-2 text-[14.5px] text-[#525257]">{t("pickup_fee_note")}</p>

      <div className="mt-8 grid grid-cols-1 gap-5">
        <Field label={t("field_pickup_address")}>
          <input
            value={state.pickup.address}
            onChange={(e) => dispatch({ type: "set_pickup_address", value: e.target.value })}
            placeholder={t("field_pickup_address_ph")}
            className={inputCls()}
            autoFocus
          />
        </Field>
        <Field label={t("field_pickup_floor")}>
          <input
            value={state.pickup.floor}
            onChange={(e) => dispatch({ type: "set_pickup_floor", value: e.target.value })}
            placeholder={t("field_pickup_floor_ph")}
            className={inputCls()}
          />
        </Field>
        <fieldset>
          <legend className="block text-[12px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
            {t("field_pickup_when")}
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {slots.map((s) => {
              const active = state.pickup.when === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => dispatch({ type: "set_pickup_when", value: s.id })}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-3 text-[14px] font-medium transition-colors",
                    active ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.04] text-[var(--color-accent)]" : "border-black/[0.08] bg-white text-[#1d1d1f] hover:border-black/20",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!ok}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all",
            ok ? "bg-black text-white hover:scale-[1.02]" : "cursor-not-allowed bg-black/[0.06] text-[#6e6e73]",
          )}
        >
          {t("continue")} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StepDate({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("book");
  // Value format: "YYYY-MM-DD|HH:MM" so we can store both date + time slot in one string
  const [datePart, slotPart] = value.split("|");

  // generate next 14 days, skip Sundays
  const dates: { iso: string; label: string; sub: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i + 1);
    const wd = d.getDay();
    if (wd === 0) continue; // skip Sunday
    dates.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("de-AT", { weekday: "short", day: "2-digit", month: "short" }),
      sub: d.getDate() === new Date().getDate() + 1 ? "morgen" : "",
    });
  }

  const slots: { id: string; label: string }[] = [
    { id: "10:00", label: "Vormittag · 10-12" },
    { id: "13:00", label: "Mittag · 13-15" },
    { id: "15:30", label: "Nachmittag · 15-17" },
    { id: "17:30", label: "Abend · 17-19" },
  ];

  const setDate = (d: string) => onChange(`${d}|${slotPart ?? ""}`);
  const setSlot = (s: string) => onChange(`${datePart ?? ""}|${s}`);
  const complete = !!datePart && !!slotPart;

  return (
    <div className="p-6 md:p-12">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]">
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_date_title")}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {dates.slice(0, 12).map((d) => {
          const active = datePart === d.iso;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => setDate(d.iso)}
              className={cn(
                "rounded-2xl border-2 px-4 py-3 text-left transition-colors",
                active ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.04]" : "border-black/[0.08] bg-white hover:border-black/20",
              )}
            >
              <div className="text-[14px] font-medium capitalize">{d.label}</div>
              {d.sub && <div className="text-[12px] text-[var(--color-accent)]">{d.sub}</div>}
            </button>
          );
        })}
      </div>

      {datePart && (
        <div className="mt-8">
          <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
            Uhrzeit
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {slots.map((s) => {
              const active = slotPart === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlot(s.id)}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-3 text-center text-[13.5px] font-medium transition-colors",
                    active ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.04] text-[var(--color-accent)]" : "border-black/[0.08] bg-white text-[#1d1d1f] hover:border-black/20",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[12.5px] text-[#6e6e73]">
            Mo-Sa 9:00-19:00 · Sonntag 9:00-18:00. Walk-in jederzeit möglich.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!complete}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all",
            complete ? "bg-black text-white hover:scale-[1.02]" : "cursor-not-allowed bg-black/[0.06] text-[#6e6e73]",
          )}
        >
          {t("continue")} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type ContactFormData = z.infer<typeof contactSchema>;

function StepContact({
  state,
  onBack,
  onSubmit,
}: {
  state: State;
  onBack: () => void;
  onSubmit: (d: ContactFormData & { _hp: string }) => Promise<void>;
}) {
  const t = useTranslations("book");
  const te = useTranslations("form_error");
  const [honeypot, setHoneypot] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: state.contact.name,
      email: state.contact.email,
      phone: state.contact.phone,
      message: state.contact.message,
    },
    mode: "onChange",
  });

  return (
    <div className="p-6 md:p-12">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]">
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_contact_title")}
      </h2>
      <form
        onSubmit={handleSubmit((data) => onSubmit({ ...data, _hp: honeypot }))}
        className="mt-8 grid grid-cols-1 gap-5"
      >
        {/* Honeypot — hidden from humans, fills only when a bot mass-fills
         * inputs by selector. Server rejects (silently) on non-empty. */}
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
        <Field label={t("field_name")}>
          <input {...register("name")} className={inputCls()} autoFocus />
          {errors.name && <span className="mt-1 block text-[12px] text-red-600">{te("name")}</span>}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("field_email")}>
            <input type="email" {...register("email")} className={inputCls()} />
            {errors.email && <span className="mt-1 block text-[12px] text-red-600">{te("email")}</span>}
          </Field>
          <Field label={t("field_phone")}>
            <input type="tel" {...register("phone")} className={inputCls()} />
            {errors.phone && <span className="mt-1 block text-[12px] text-red-600">{te("phone")}</span>}
          </Field>
        </div>
        <Field label={t("field_message")}>
          <textarea rows={3} {...register("message")} className={inputCls("resize-none")} />
        </Field>
        <label className="flex items-start gap-3 rounded-2xl bg-[#f7f7f8] p-4 text-[13.5px] text-[#1d1d1f]">
          <input
            type="checkbox"
            {...register("agb")}
            className="mt-0.5 h-4 w-4 rounded border-black/30 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          <span>{t("agb")}</span>
        </label>

        <div className="mt-2 flex items-center justify-between">
          {state.total != null && (
            <div className="text-[14px] text-[#525257]">
              Geschätzter Festpreis: <strong className="text-[var(--color-text-dark)]">{state.total} €</strong>
            </div>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn(
              "ml-auto inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all",
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
            {isSubmitting ? t("submitting") : t("submit")}
            {!isSubmitting && <Calendar className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Success({
  onReset,
  leadId,
  leadToken,
}: {
  onReset: () => void;
  leadId: string | null;
  leadToken: string | null;
}) {
  const t = useTranslations("book");
  return (
    <div className="p-10 text-center md:p-16">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-success)] text-white"
      >
        <Check className="h-7 w-7" strokeWidth={2.5} />
      </motion.div>
      <h2 className="mt-6 text-[28px] font-semibold tracking-[-0.02em]">{t("success_title")}</h2>
      <p className="mx-auto mt-3 max-w-md text-[15.5px] leading-[1.55] text-[#525257]">{t("success_sub")}</p>

      {leadId && (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-black/[0.06] bg-black/[0.02] p-5 text-left">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#86868B]">
            Auftrags-ID
          </div>
          <div className="mt-1 font-mono text-[13px] text-[#1d1d1f]">
            {leadId.slice(0, 8)}…
          </div>
          <a
            href={`/status/${leadId}${leadToken ? `?t=${leadToken}` : ""}`}
            className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--color-accent)] hover:underline"
          >
            Status live verfolgen →
          </a>
        </div>
      )}

      <a
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 text-[14px] text-[var(--color-accent)] hover:underline"
      >
        {t("success_back")} →
      </a>
      <button
        onClick={onReset}
        className="ml-4 mt-8 inline-flex items-center gap-1 text-[14px] text-[#6e6e73] hover:text-[var(--color-text-dark)]"
      >
        nochmal buchen
      </button>
    </div>
  );
}
