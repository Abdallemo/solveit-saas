"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { LogoTicker } from "./LogoTicker";
import { stats, techLogos } from "./mockdata";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.25, 0, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.section
      className="relative z-10 container flex max-w-7xl flex-col items-center justify-center py-12 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Badge */}
      <motion.div variants={itemVariants}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-muted-foreground">
            Trusted by 10,000+ students
          </span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        className="max-w-4xl text-center space-y-6"
        variants={itemVariants}
      >
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Where Students <span className="text-primary">Collaborate</span>
          <br />
          and Get{" "}
          <span className="relative inline-block">
            Rewarded
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M2 8.5C50 2.5 150 2.5 198 8.5"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              />
            </svg>
          </span>
        </h1>

        <motion.p
          className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl"
          variants={itemVariants}
        >
          Post tasks, find expert help, and pay securely. SolveIt connects you
          with verified students who can help you succeed — all backed by AI
          matching and escrow protection.
        </motion.p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        className="mt-10 flex flex-col sm:flex-row gap-4"
        variants={itemVariants}
      >
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
          <Link href="#demo">
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold tracking-tight sm:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      <section className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-20 ">
        <div className="text-center ">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built with modern technology
          </h2>
          <p className="text-muted-foreground">
            We use the best tools and frameworks to build your application
          </p>
        </div>
        <LogoTicker logos={[...techLogos]} showNames={true} />
      </section>
    </motion.section>
  );
}
