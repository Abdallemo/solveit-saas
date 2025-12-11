import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen flex flex-col items-center scroll-smooth">
      <div className="z-10 w-full max-w-7xl px-4 ">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
