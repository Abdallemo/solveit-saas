"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { companyLogos, techLogos } from "./mockdata"



interface LogoTickerProps {
  className?: string
  speed?: "slow" | "normal" | "fast"
  logos: Array<{ name: string; icon: any; color?: string }>
  title?: string
  showNames?: boolean
}

const speedMap = {
  slow: "60s",
  normal: "30s",
  fast: "15s",
}

export function LogoTicker({ className, speed = "normal", logos, title, showNames = false }: LogoTickerProps) {
  const [isPaused, setIsPaused] = useState(false)
  const duration = speedMap[speed]

  return (
    <div className={cn("w-full overflow-hidden py-8", className)}>
      {title && <p className="mb-8 text-center text-sm font-medium text-muted-foreground">{title}</p>}

      <div className="relative">
     
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background via-background/80 to-transparent" />

        <div
          className="flex items-center gap-8 animate-scroll"
          style={{
            animationDuration: duration,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
       
          {[...logos, ...logos, ...logos].map((logo, i) => {
            const IconComponent = logo.icon
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center gap-3 px-6 py-4 rounded-lg",
                  "bg-card/50 border border-border/50 backdrop-blur-sm",
                  "hover:bg-card/80 hover:border-border transition-all duration-300",
                  "min-w-fit whitespace-nowrap",
                  showNames ? "min-w-[160px]" : "min-w-[80px]",
                )}
              >
                <IconComponent className={cn("h-6 w-6 transition-colors", logo.color || "text-muted-foreground")} />
                {showNames && <span className="text-sm font-medium text-foreground">{logo.name}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


export function TechStackTicker({
  className,
  speed = "normal",
  showNames = false,
}: Omit<LogoTickerProps, "logos" | "title">) {
  return <LogoTicker className={className} speed={speed} logos={techLogos.slice(0, 6)} showNames={showNames} />
}

export function CompanyTicker({
  className,
  speed = "normal",
  showNames = false,
}: Omit<LogoTickerProps, "logos" | "title">) {
  return (
    <LogoTicker
      className={className}
      speed={speed}
      logos={companyLogos.slice(0, 6)}
      title="Trusted by industry leaders"
      showNames={showNames}
    />
  )
}

export function MinimalLogoTicker({
  className,
  speed = "normal",
  logos,
}: Omit<LogoTickerProps, "title" | "showNames">) {
  const duration = speedMap[speed]

  return (
    <div className={cn("w-full overflow-hidden ", className)}>
      <div className="relative">
      

        <div
          className="flex items-center gap-12 animate-scroll"
          style={{
            animationDuration: duration,
          }}
        >
          {[...logos, ...logos, ...logos].map((logo, i) => {
            const IconComponent = logo.icon
            return (
              <div
                key={i}
                className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <IconComponent className="h-8 w-8 text-muted-foreground" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
