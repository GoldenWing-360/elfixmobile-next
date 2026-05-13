import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { PickupBanner } from "@/components/sections/PickupBanner";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";
import { ProcessSteps } from "@/components/sections/ProcessSteps";

// Below-fold sections lazy-loaded to shrink first-load JS by ~150-200 kB
const BrandGallery = dynamic(() => import("@/components/sections/BrandGallery").then(m => ({ default: m.BrandGallery })));
const PriceCalculatorPreview = dynamic(() => import("@/components/sections/PriceCalculatorPreview").then(m => ({ default: m.PriceCalculatorPreview })));
const Location = dynamic(() => import("@/components/sections/Location").then(m => ({ default: m.Location })));
const Reviews = dynamic(() => import("@/components/sections/Reviews").then(m => ({ default: m.Reviews })));
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })));
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA").then(m => ({ default: m.FinalCTA })));

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <PickupBanner />
      <ServiceShowcase />
      <ProcessSteps />
      <BrandGallery />
      <PriceCalculatorPreview />
      <Location />
      <Reviews />
      <FAQ />
      <FinalCTA />
    </>
  );
}
