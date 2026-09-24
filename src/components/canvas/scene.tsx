"use client";

import "@/lib/three-console";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { ReactNode } from "react";

type SceneProps = Omit<CanvasProps, "children"> & {
  children: ReactNode;
  /** Rendered instead of the canvas when the visitor asks for reduced motion. */
  fallback?: ReactNode;
};

/**
 * Configured R3F canvas. Import this through `LazyScene` rather than directly
 * so three.js stays out of the server bundle and off the critical path.
 *
 * Defaults chosen for a scroll-driven marketing site:
 * - `dpr` capped at 2, so 3x phones don't render 9x the pixels
 * - `frameloop="demand"` is deliberately NOT set; most scenes here animate
 *   continuously. Pass it explicitly for static scenes.
 * - `powerPreference: "high-performance"` hints at the discrete GPU.
 */
export function Scene({ children, fallback = null, ...props }: SceneProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion && fallback !== null) return <>{fallback}</>;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      {...props}
    >
      {children}
    </Canvas>
  );
}
