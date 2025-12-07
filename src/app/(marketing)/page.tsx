import CTA from "@/components/marketing/cta";
import DemoSection from "@/components/marketing/DemoSection";
import FAQ from "@/components/marketing/faq";
import Features from "@/components/marketing/features";
import Footer from "@/components/marketing/footer";
import Hero from "@/components/marketing/hero";
import MouseMoveEffect from "@/components/marketing/mouse-move-effect";
import Pricing from "@/components/marketing/pricing";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <MouseMoveEffect />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 " />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px]  blur-[100px]" />
      </div>

      <div className="w-full">
        <Hero />
        <DemoSection />
        <Features />
        <CTA />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}
