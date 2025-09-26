"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, Move, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface FloatingVideoProps {
  children: React.ReactNode;
  defaultMinimized?: boolean;
  onClose?: () => void;
  className?: string;
  minimizedSize?: { width: number; height: number };
  expandedSize?: { width: number; height: number };
}

export function FloatingVideo({
  children,
  defaultMinimized = false,
  onClose,
  className,
  minimizedSize = { width: 192, height: 112 }, // w-48 h-28
  expandedSize = { width: 320, height: 240 }, // w-80 h-60
}: FloatingVideoProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const currentSize = isMinimized ? minimizedSize : expandedSize;
      const maxX = window.innerWidth - currentSize.width;
      const maxY = window.innerHeight - currentSize.height;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized, minimizedSize, expandedSize]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    const updatePosition = () => {
      const currentSize = isMinimized ? minimizedSize : expandedSize;
      setPosition({
        x: window.innerWidth - currentSize.width - 20,
        y: window.innerHeight - currentSize.height - 20,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isMinimized, minimizedSize, expandedSize]);

  if (!isVisible) return null;

  const currentSize = isMinimized ? minimizedSize : expandedSize;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 bg-background rounded-lg shadow-2xl border border-border overflow-hidden transition-all duration-300 ease-in-out",
        isDragging ? "cursor-grabbing scale-105 shadow-3xl" : "cursor-grab",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
      }}
      onMouseDown={handleMouseDown}>
      <div className="w-full h-full relative">{children}</div>

      <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/50 rounded p-1">
          <Move className="w-4 h-4 text-white" />
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none",
          isMinimized && "opacity-100"
        )}>
        <div className="p-3 flex items-center justify-end pointer-events-auto">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize();
              }}>
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-4 h-4 opacity-0 hover:opacity-100 transition-opacity">
        <div className="w-full h-full bg-white/20 rounded-tl-lg flex items-end justify-end p-1">
          <div className="w-2 h-2 border-r-2 border-b-2 border-white/60" />
        </div>
      </div>
    </div>
  );
}
