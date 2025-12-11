"use client";

import { cn } from "@/lib/utils/utils";

export function ThreeDPlayerLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full aspect-video bg-background/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden flex items-center justify-center",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            animation: "grid-move 20s linear infinite",
          }}
        />
      </div>

      <div className="absolute w-64 h-64 rounded-full bg-muted/50 blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="scene" style={{ perspective: "200px" }}>
          <div className="cube-wrapper">
            <div className="cube">
              <div className="cube-face front" />
              <div className="cube-face back" />
              <div className="cube-face right" />
              <div className="cube-face left" />
              <div className="cube-face top" />
              <div className="cube-face bottom" />
            </div>
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Loading 3D Scene
        </p>
      </div>
    </div>
  );
}
