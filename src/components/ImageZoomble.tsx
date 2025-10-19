"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const zoomIn = () => setScale((s) => Math.min(s * 1.25, 5));
  const zoomOut = () => {
    setScale((s) => {
      const newScale = Math.max(s / 1.25, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };
  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const clampPosition = (x: number, y: number) => {
    if (!containerRef.current) return { x, y };

    const rect = containerRef.current.getBoundingClientRect();
    const maxOffsetX = (rect.width * (scale - 1)) / 2;
    const maxOffsetY = (rect.height * (scale - 1)) / 2;

    return {
      x: Math.max(-maxOffsetX, Math.min(x, maxOffsetX)),
      y: Math.max(-maxOffsetY, Math.min(y, maxOffsetY)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || scale <= 1) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    setPosition((prev) => {
      const newPos = clampPosition(prev.x + dx, prev.y + dy);
      return newPos;
    });

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setDragging(false);
  const handleMouseLeave = () => setDragging(false);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full bg-transparent select-none"
      style={{ overflow: "hidden", cursor: scale > 1 ? "grab" : "default" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}>
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            zoomOut();
          }}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 text-xs font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            reset();
          }}>
          1:1
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Image
        src={src}
        alt={alt}
        draggable={false}
        width={1000} height={1000}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.2s ease-out",
          width: "100%",
          height: "auto",
          objectFit: "contain",
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
        }}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

export default ZoomableImage;
