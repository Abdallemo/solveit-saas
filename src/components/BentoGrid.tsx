import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function FeaturesSectionDemo() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <div className="relative w-full max-w-4xl aspect-square">
        <GlobeComponent />
      </div>
    </div>
  );
}

const GlobeComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [37.7749, -122.4194], size: 0.1 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.1 },   // New York
        { location: [51.5074, -0.1278], size: 0.1 },    // London
        { location: [35.6762, 139.6503], size: 0.1 },   // Tokyo
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
        state.width = 1000;
        state.height = 1000;
      },
    });

    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: '1/1',
      }}
    />
  );
};