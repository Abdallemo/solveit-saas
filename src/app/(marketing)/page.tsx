import Hero from "@/components/marketing/hero";
import Features from "@/components/marketing/features";
import CTA from "@/components/marketing/cta";
import Footer from "@/components/marketing/footer";
import MouseMoveEffect from "@/components/marketing/mouse-move-effect";
import Navbar from "@/components/marketing/navbar";
import Pricing from "@/components/marketing/pricing";
import DemoSection from "@/components/marketing/DemoSection";


export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center scroll-smooth">
      <MouseMoveEffect />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-7xl px-4 ">
        <Navbar />
        <Hero />
        <DemoSection/>
        <Features />
        <CTA />
        <Pricing />
        <Footer />
      </div>
      
    </div>
  );
}