"use client";

import type React from "react";

interface Logo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LogoTickerProps {
  logos: Logo[];
  speed?: number;
  title?: string;
  showNames?: boolean;
}
export function LogoTicker({
  logos,
  speed = 30,
  title,
  showNames = true,
}: LogoTickerProps) {
  return (
    <div className="relative w-full py-12">
      {title && (
        <p className="text-center text-sm text-muted-foreground mb-8">
          {title}
        </p>
      )}

      <div className="relative overflow-hidden">
        {/* Gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div
          className="flex w-max animate-scroll"
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {/* First set */}
          {logos.map((logo, index) => (
            <div
              key={`first-${index}`}
              className="flex items-center gap-2 px-6 md:px-8 shrink-0"
            >
              <logo.icon className="h-5 w-5 text-foreground/60" />
              {showNames && (
                <span className="text-sm font-medium text-foreground/60 whitespace-nowrap">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <div
              key={`second-${index}`}
              className="flex items-center gap-2 px-6 md:px-8 shrink-0"
            >
              <logo.icon className="h-5 w-5 text-foreground/60" />
              {showNames && (
                <span className="text-sm font-medium text-foreground/60 whitespace-nowrap">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
