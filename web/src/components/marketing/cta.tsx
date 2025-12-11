"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const benefits = [
  "No credit card required",
  "Free forever for basic use",
  "Cancel anytime",
];

export default function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="container max-w-screen-xl">
        <motion.div
          className="relative overflow-hidden rounded-3xl border bg-muted/30 p-8 md:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle gradient accent */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-4">
              Get Started Today
            </Badge>

            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to transform how you collaborate?
            </h2>

            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Join thousands of students who are already using SolveIt to get
              help, earn money, and succeed academically.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-transparent"
                asChild
              >
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
