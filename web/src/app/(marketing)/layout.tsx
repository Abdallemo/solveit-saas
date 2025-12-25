import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-background">
      <div className="flex flex-col w-full max-w-7xl px-4 min-h-screen">
        <Navbar />

        <main className="flex-1 w-full h-full flex flex-col">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
