import CTA from "@/components/marketing/cta";
import DemoSection, { DemoVideo } from "@/components/marketing/DemoSection";
import FAQ from "@/components/marketing/faq";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import MouseMoveEffect from "@/components/marketing/mouse-move-effect";
import Pricing from "@/components/marketing/pricing";
import Testimonials from "@/components/marketing/testamonial";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <MouseMoveEffect />

      <div className="w-full">
        <Hero />
        <DemoVideo />

        <DemoSection />

        <Features />
        <Testimonials />
        <CTA />
        <Pricing />
        <FAQ />
      </div>
    </div>
  );
}
