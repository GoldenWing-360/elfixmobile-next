import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { PickupBanner } from "@/components/sections/PickupBanner";
import { ServiceShowcase } from "@/components/sections/ServiceShowcase";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { BrandGallery } from "@/components/sections/BrandGallery";
import { PriceCalculatorPreview } from "@/components/sections/PriceCalculatorPreview";
import { Location } from "@/components/sections/Location";
import { Reviews } from "@/components/sections/Reviews";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

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
