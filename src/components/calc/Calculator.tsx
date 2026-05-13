"use client";

import { useReducer, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, ChevronLeft, RotateCcw, Search, Phone, MessageCircle, Calendar, Truck } from "lucide-react";
import { Button } from "@/components/Button";
import pricing from "@/data/pricing.json";
import { cn } from "@/lib/cn";

type Brand = { id: string; label: string; parent_brand: string; device_type: string; models: Model[] };
type Model = { slug: string; name: string; full_name: string; year: number | null; prices: Record<string, number> };
type Repair = { slug: string; label_de: string; label_en: string };

const BRANDS = pricing.brands as unknown as Record<string, Brand>;
const REPAIRS = pricing.repair_types as unknown as Repair[];

type State = {
  step: 0 | 1 | 2 | 3;
  brandId: string | null;
  modelSlug: string | null;
  repairs: string[];
};

type Action =
  | { type: "pick_brand"; brandId: string }
  | { type: "pick_model"; slug: string }
  | { type: "toggle_repair"; slug: string }
  | { type: "back" }
  | { type: "next" }
  | { type: "restart" };

const initialState: State = { step: 0, brandId: null, modelSlug: null, repairs: [] };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "pick_brand":
      return { ...s, brandId: a.brandId, modelSlug: null, repairs: [], step: 1 };
    case "pick_model":
      return { ...s, modelSlug: a.slug, repairs: [], step: 2 };
    case "toggle_repair":
      return {
        ...s,
        repairs: s.repairs.includes(a.slug)
          ? s.repairs.filter((r) => r !== a.slug)
          : [...s.repairs, a.slug],
      };
    case "back":
      return { ...s, step: Math.max(0, s.step - 1) as State["step"] };
    case "next":
      return { ...s, step: Math.min(3, s.step + 1) as State["step"] };
    case "restart":
      return initialState;
  }
}

export function Calculator() {
  const t = useTranslations("calc_page");
  const tr = useTranslations("repair_label");
  const [state, dispatch] = useReducer(reducer, initialState);
  const params = useSearchParams();

  // Deeplink pre-fill: ?brand=apple-iphone&repair=display
  useEffect(() => {
    const b = params.get("brand");
    if (b && BRANDS[b]) {
      dispatch({ type: "pick_brand", brandId: b });
      const r = params.get("repair");
      if (r) {
        // Auto-jump to repair step + preselect the repair (only if first model has it priced)
        setTimeout(() => {
          dispatch({ type: "toggle_repair", slug: r });
        }, 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brand = state.brandId ? BRANDS[state.brandId] : null;
  const model = useMemo(
    () => (brand && state.modelSlug ? brand.models.find((m) => m.slug === state.modelSlug) ?? null : null),
    [brand, state.modelSlug],
  );

  const availableRepairs = useMemo(() => {
    if (!model) return [] as Repair[];
    return REPAIRS.filter((r) => typeof model.prices[r.slug] === "number");
  }, [model]);

  const total = useMemo(() => {
    if (!model) return 0;
    return state.repairs.reduce((sum, slug) => sum + (model.prices[slug] ?? 0), 0);
  }, [model, state.repairs]);

  return (
    <section className="relative bg-[var(--color-bg-secondary)] text-[var(--color-text-dark)]">
      <div className="mx-auto max-w-5xl px-6 py-24 md:px-8 md:py-32">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.55] text-[#525257]">
            {t("sub")}
          </p>
        </header>

        <Progress step={state.step} />

        <div className="relative mt-10 overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04] md:mt-14">
          <AnimatePresence mode="wait" initial={false}>
            {state.step === 0 && (
              <motion.div key="brand" {...slide()}>
                <StepBrand
                  brands={Object.values(BRANDS)}
                  onPick={(id) => dispatch({ type: "pick_brand", brandId: id })}
                />
              </motion.div>
            )}
            {state.step === 1 && brand && (
              <motion.div key="model" {...slide()}>
                <StepModel
                  brand={brand}
                  onBack={() => dispatch({ type: "back" })}
                  onPick={(slug) => dispatch({ type: "pick_model", slug })}
                />
              </motion.div>
            )}
            {state.step === 2 && brand && model && (
              <motion.div key="repair" {...slide()}>
                <StepRepair
                  model={model}
                  repairs={availableRepairs}
                  selected={state.repairs}
                  total={total}
                  labelFor={(slug: string) => tr(slug as "display") ?? slug}
                  onBack={() => dispatch({ type: "back" })}
                  onToggle={(slug) => dispatch({ type: "toggle_repair", slug })}
                  onNext={() => dispatch({ type: "next" })}
                />
              </motion.div>
            )}
            {state.step === 3 && brand && model && (
              <motion.div key="result" {...slide()}>
                <StepResult
                  brand={brand}
                  model={model}
                  selected={state.repairs}
                  total={total}
                  labelFor={(slug: string) => tr(slug as "display") ?? slug}
                  onBack={() => dispatch({ type: "back" })}
                  onRestart={() => dispatch({ type: "restart" })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Progress({ step }: { step: number }) {
  const labels = ["Marke", "Modell", "Reparatur", "Ergebnis"];
  return (
    <ol className="mt-12 flex items-center justify-center gap-2 text-[12px] text-[#6e6e73]">
      {labels.map((l, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={l} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold tabular-nums transition-colors",
                done
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : active
                    ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-black/15 text-[#6e6e73]",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", active && "text-[var(--color-text-dark)] font-medium")}>
              {l}
            </span>
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

function StepBrand({ brands, onPick }: { brands: Brand[]; onPick: (id: string) => void }) {
  const t = useTranslations("calc_page");
  return (
    <div className="p-6 md:p-12">
      <h2 className="text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">{t("step_brand_title")}</h2>
      <p className="mt-2 text-[15px] text-[#525257]">{t("step_brand_sub")}</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
        {brands.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.id)}
            className="group relative flex items-center justify-between gap-4 rounded-2xl border border-black/[0.08] bg-white p-5 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-md"
          >
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                {b.parent_brand}
              </div>
              <div className="mt-1 text-[18px] font-semibold tracking-[-0.005em]">{b.label}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#6e6e73]">{b.models.length} Modelle</span>
              <span className="text-[var(--color-accent)] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepModel({
  brand,
  onPick,
  onBack,
}: {
  brand: Brand;
  onPick: (slug: string) => void;
  onBack: () => void;
}) {
  const t = useTranslations("calc_page");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return brand.models.slice(0, 18);
    return brand.models.filter(
      (m) =>
        m.full_name.toLowerCase().includes(needle) || m.name.toLowerCase().includes(needle),
    );
  }, [brand.models, q]);

  return (
    <div className="p-6 md:p-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_model_title")}
      </h2>
      <p className="mt-2 text-[15px] text-[#525257]">{t("step_model_sub")}</p>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e6e73]" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("step_model_search")}
          className="w-full rounded-2xl border border-black/[0.08] bg-white py-3.5 pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </div>

      <div className="mt-6 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#f7f7f8] p-6 text-center text-[14px] text-[#525257]">
            {t("step_model_empty")}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filtered.map((m) => (
              <li key={m.slug}>
                <button
                  type="button"
                  onClick={() => onPick(m.slug)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-[#f7f7f8]"
                >
                  <span className="truncate text-[15px] font-medium text-[#1d1d1f]">
                    {m.full_name}
                  </span>
                  <span className="text-[var(--color-accent)] opacity-0 transition-opacity hover:opacity-100">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StepRepair({
  model,
  repairs,
  selected,
  total,
  labelFor,
  onToggle,
  onBack,
  onNext,
}: {
  model: Model;
  repairs: Repair[];
  selected: string[];
  total: number;
  labelFor: (slug: string) => string;
  onToggle: (slug: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("calc_page");
  return (
    <div className="p-6 md:p-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[28px]">
        {t("step_repair_title")}
      </h2>
      <p className="mt-2 text-[15px] text-[#525257]">
        {model.full_name}{model.year ? ` · ${model.year}` : ""}
      </p>

      {repairs.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-[#f7f7f8] p-6 text-[14px] text-[#525257]">
          {t("step_repair_none_available")}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {repairs.map((r) => {
            const price = model.prices[r.slug];
            const active = selected.includes(r.slug);
            return (
              <button
                key={r.slug}
                type="button"
                onClick={() => onToggle(r.slug)}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.04]"
                    : "border-black/[0.08] bg-white hover:border-black/20",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-md border-2 transition-colors",
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                        : "border-black/20",
                    )}
                  >
                    {active && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className="text-[15px] font-medium">{labelFor(r.slug)}</span>
                </div>
                <span className="font-semibold tabular-nums text-[var(--color-accent)]">
                  {price} €
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between rounded-2xl bg-[#f7f7f8] p-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#6e6e73]">
            {t("result_title")}
          </div>
          <div className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.03em]">
            {total} €
          </div>
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={selected.length === 0}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all",
            selected.length > 0
              ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:scale-[1.02]"
              : "cursor-not-allowed bg-black/[0.06] text-[#86868b]",
          )}
        >
          {t("next")} →
        </button>
      </div>
    </div>
  );
}

function StepResult({
  brand,
  model,
  selected,
  total,
  labelFor,
  onBack,
  onRestart,
}: {
  brand: Brand;
  model: Model;
  selected: string[];
  total: number;
  labelFor: (slug: string) => string;
  onBack: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations("calc_page");
  const [bookHref, setBookHref] = useState("/buchen");

  useEffect(() => {
    const p = new URLSearchParams({
      brand: brand.id,
      // Pass the human-readable name so the booking device field is usable
      model: model.full_name,
      repairs: selected.join(","),
      total: String(total),
    });
    setBookHref(`/buchen?${p.toString()}`);
  }, [brand.id, model.slug, selected, total]);

  const waMsg = encodeURIComponent(
    `Hi! Ich brauche eine ${selected.map(labelFor).join(", ")} Reparatur für mein ${model.full_name}. Festpreis laut Online-Rechner: ${total} €.`,
  );

  return (
    <div className="p-6 md:p-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#6e6e73]">{t("result_for")}</div>
          <div className="mt-1 text-[17px] font-medium">{model.full_name}</div>
          <div className="mt-1 text-[13px] text-[#6e6e73]">{brand.parent_brand} - {brand.label}</div>

          <div className="mt-6 text-[11px] uppercase tracking-[0.18em] text-[#6e6e73]">
            {t("result_title")}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[clamp(3.5rem,9vw,6rem)] font-semibold leading-none tracking-[-0.04em] text-black">
              {total}
            </span>
            <span className="text-[32px] font-medium text-[#6e6e73]">€</span>
          </div>

          <ul className="mt-6 space-y-2 text-[14px] text-[#3a3a3a]">
            {selected.map((s) => (
              <li key={s} className="flex items-center justify-between border-b border-black/[0.06] pb-2">
                <span>{labelFor(s)}</span>
                <span className="font-semibold tabular-nums">{model.prices[s]} €</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-success)]">
            {t("result_includes_eyebrow")}
          </div>
          <ul className="mt-3 space-y-2.5 text-[14.5px] text-[#1d1d1f]">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <span>{t(`result_includes_${i}` as "result_includes_1")}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-1 gap-3">
            <Button href={bookHref} variant="primary" size="lg" magnetic>
              <Calendar className="h-4 w-4" />
              {t("result_cta_book")}
            </Button>
            <Button
              href={`${bookHref}&service=pickup`}
              variant="secondary"
              size="lg"
              className="!bg-black !text-white !border-black/0"
            >
              <Truck className="h-4 w-4" />
              {t("result_cta_pickup")}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button href={`https://wa.me/436606071414?text=${waMsg}`} variant="secondary" size="md" className="!bg-[#25D366]/[0.12] !text-[#0e6b32] !border-[#25D366]/30">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button href="tel:+436606071414" variant="secondary" size="md" className="!bg-black/[0.04] !text-[#1d1d1f] !border-black/10">
                <Phone className="h-4 w-4" />
                {t("result_cta_call")}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#6e6e73] hover:text-[var(--color-text-dark)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("restart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
