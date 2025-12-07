"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";

const SolveItDemo = dynamic(() => import("./SolveItDemo"), {
  ssr: false,
});
export default function DemoSection() {
  const isMobile = useIsMobile();
  return (
    !isMobile && (
      <section id="Demo">
        <div className=" mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold ">
              Experience SolveIt in Action
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              Try our interactive workspace demo. No signup required - explore
              the rich text editor, code viewer, mentorship chat, and file
              management system.
            </p>
          </div>

          <SolveItDemo />
        </div>
      </section>
    )
  );
}
