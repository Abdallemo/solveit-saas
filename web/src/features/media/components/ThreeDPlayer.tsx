"use client";
import "@google/model-viewer";
import { ModelViewerElement } from "@google/model-viewer";
import { useRef } from "react";

export function ThreeDPlayer({ src, alt }: { src: string; alt?: string }) {
  const modelRef = useRef<ModelViewerElement>(null);

  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      {/* @ts-expect-error: Custom Web Component */}
      <model-viewer
        ref={modelRef}
        src={src}
        alt={alt || "3D Model"}
        auto-rotate
        camera-controls
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
