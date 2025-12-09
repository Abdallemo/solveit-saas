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
      <section id="Demo" className="lg:py-28">
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
export function DemoVideo() {
  return (
    <section id="demo" className="lg:py-10">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            SolveIt Demo
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            a Quick Demo of the poster and solver capabilities
          </p>
        </div>

        <video src={"/demo.mp4"} autoPlay muted controls />
      </div>
    </section>
  );
}
