"use client";

import type React from "react";

import { motion } from "framer-motion";

interface Logo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LogoTickerProps {
  logos: Logo[];
  speed?: "slow" | "normal" | "fast";
}

export function MinimalLogoTicker({
  logos,
  speed = "normal",
}: LogoTickerProps) {
  const duration = speed === "fast" ? 15 : speed === "slow" ? 30 : 20;

  return (
    <div className="relative mt-4 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      <motion.div
        className="flex gap-12 py-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-muted-foreground/60 shrink-0"
          >
            <logo.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{logo.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
