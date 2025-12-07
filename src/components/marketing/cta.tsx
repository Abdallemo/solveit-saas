import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="border-t">
      <div className="flex flex-col items-center gap-4 py-24 text-center md:py-32">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Ready to transform task collaboration and payments?
        </h2>
        <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Join leading students and academic institutions who trust SolveIt to
          streamline task management, secure payments, and foster efficient
          academic collaboration. Revolutionize how tasks are completed and
          ensure fair compensation—all powered by AI.
        </p>

        <Button size="lg" className="mt-4" asChild>
          <Link href={"/dashboard"}>Get Started Today</Link>
        </Button>
      </div>
    </section>
  );
}
