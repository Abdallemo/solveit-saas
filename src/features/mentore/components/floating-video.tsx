"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";

interface FloatingVideoProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isVisible?: boolean;
  micOn: boolean;
  cameraOn: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  endCall: () => Promise<void>;
  className?: string;
}

type ZoomLevel = "small" | "medium" | "large";

const ZOOM_SIZES = {
  small: { width: 200, height: 150 },
  medium: { width: 280, height: 210 },
  large: { width: 360, height: 270 },
};

export function FloatingVideo({
  videoRef,
  isVisible = true,
  micOn,
  cameraOn,
  onToggleMute,
  onToggleCamera,
  className,
  endCall,
}: FloatingVideoProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("medium");
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSize = ZOOM_SIZES[zoomLevel];

  const cycleZoom = () => {
    setZoomLevel((prev) => {
      if (prev === "small") return "medium";
      if (prev === "medium") return "large";
      return "small";
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - currentSize.width - 20;
      const maxY = window.innerHeight - currentSize.height - 20;

      setPosition({
        x: Math.max(20, Math.min(newX, maxX)),
        y: Math.max(20, Math.min(newY, maxY)),
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
  }, [isDragging, dragOffset, currentSize]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 rounded-lg overflow-hidden shadow-2xl border border-border/50 backdrop-blur-sm",
        !isDragging && "transition-all duration-200",
        isDragging ? "cursor-grabbing scale-105" : "cursor-grab",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}>
      {/* Video Container */}
      <div className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        {/* ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Video className="w-12 h-12 text-muted-foreground" />
          </div>
        )} */}

        {!cameraOn && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <VideoOff className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Drag Handle */}
        <div className="absolute top-2 left-2 text-white/60 pointer-events-none">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Controls Overlay */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 transition-opacity duration-200",
            showControls ? "opacity-100" : "opacity-0"
          )}>
          <div className="flex items-center justify-center gap-2">
            {/* Mute Button */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0",
                !micOn && "bg-destructive/80 hover:bg-destructive"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}>
              {micOn ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0",
                !cameraOn && "bg-destructive/80 hover:bg-destructive"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCamera();
              }}>
              {cameraOn ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={async () => {
                await endCall();
              }}>
              <PhoneOff size={20} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              onClick={(e) => {
                e.stopPropagation();
                cycleZoom();
              }}>
              {zoomLevel === "large" ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
