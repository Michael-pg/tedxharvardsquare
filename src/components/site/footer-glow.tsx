"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Grid pitch in CSS pixels. Tight enough to read as a tone, not as dots. */
const CELL = 9;

/**
 * Brightness buckets. Each dot is quantised into one, so a frame is a handful
 * of filled paths rather than thousands of `fillStyle` changes. The top bucket
 * is the hero's hot core colour, so the footer reads as the same material.
 */
const BUCKETS = [
  "rgba(235, 0, 40, 0.22)",
  "rgba(235, 0, 40, 0.4)",
  "rgba(235, 0, 40, 0.6)",
  "rgba(235, 0, 40, 0.85)",
  "rgb(235, 0, 40)",
  "rgb(255, 107, 127)",
];

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * The red halftone glow that rises behind the footer lockup — the hero's pixel
 * field, flattened into print. A wavy horizon drifts across the bottom of the
 * footer; below it the dots swell toward full size, above it they thin out to
 * nothing, so the gradient is made entirely of dot size, like a newspaper
 * halftone. The pointer swells the dots it passes over.
 *
 * Plain 2D canvas, not a three.js scene: a few thousand circles a frame is
 * cheap, and the footer should not pull the WebGL bundle onto pages that do
 * not otherwise need it. It only animates while on screen, and draws a single
 * still frame under reduced motion.
 */
export function FooterGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let time = Math.random() * 100;
    let visible = false;
    let running = false;
    // Pointer in canvas CSS pixels, eased; `strength` fades in and out so the
    // swell never pops on or off.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const paths = BUCKETS.map(() => new Path2D());
      const cols = Math.ceil(width / CELL) + 1;
      const rows = Math.ceil(height / CELL) + 1;
      const reach = Math.max(width, height) * 0.14;
      const t = time;

      for (let col = 0; col < cols; col++) {
        const x = col * CELL;
        // Three detuned waves make a horizon that never visibly repeats.
        const wave =
          Math.sin(x * 0.0021 + t * 0.22) * 0.5 +
          Math.sin(x * 0.0053 - t * 0.31) * 0.32 +
          Math.sin(x * 0.0117 + t * 0.47) * 0.18;
        // Height of the horizon, as a fraction of the canvas from the bottom.
        const horizon = 0.46 + wave * 0.2;

        for (let row = 0; row < rows; row++) {
          // Offset alternate rows by half a cell — the classic halftone screen.
          const px = x + (row % 2 ? CELL / 2 : 0);
          const py = row * CELL;
          const fromBottom = 1 - py / height;

          let intensity = smoothstep(horizon + 0.22, horizon - 0.3, fromBottom);
          // Fine texture so the body of the glow breathes instead of sitting flat.
          intensity *=
            0.78 + 0.22 * Math.sin(px * 0.018 + py * 0.011 + t * 0.9) * Math.sin(py * 0.024 - t * 0.6);

          if (pointer.strength > 0.01) {
            const dx = px - pointer.x;
            const dy = py - pointer.y;
            const falloff = 1 - Math.min(Math.sqrt(dx * dx + dy * dy) / reach, 1);
            intensity += falloff * falloff * 0.55 * pointer.strength;
          }

          if (intensity < 0.06) continue;
          intensity = Math.min(intensity, 1);
          const radius = CELL * 0.46 * Math.pow(intensity, 0.85);
          // The hot core colour is reserved for the brightest peaks.
          const bucket =
            intensity > 0.985
              ? BUCKETS.length - 1
              : Math.min(BUCKETS.length - 2, Math.floor(intensity * (BUCKETS.length - 1)));
          const path = paths[bucket];
          path.moveTo(px + radius, py);
          path.arc(px, py, radius, 0, Math.PI * 2);
        }
      }

      paths.forEach((path, i) => {
        ctx.fillStyle = BUCKETS[i];
        ctx.fill(path);
      });
    };

    const tick = (_: number, deltaMs: number) => {
      time += Math.min(deltaMs, 50) / 1000;
      const follow = 1 - Math.pow(0.002, Math.min(deltaMs, 50) / 1000);
      pointer.x += (pointer.tx - pointer.x) * follow;
      pointer.y += (pointer.ty - pointer.y) * follow;
      pointer.strength += (pointer.target - pointer.strength) * follow;
      draw();
    };

    const start = () => {
      if (running || reducedMotion || !visible) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      if (pointer.target === 0) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersection.observe(canvas);

    // The canvas sits behind the footer's content, so listen on its parent.
    const surface = canvas.parentElement;
    if (!reducedMotion && surface) {
      surface.addEventListener("pointermove", onMove);
      surface.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      surface?.removeEventListener("pointermove", onMove);
      surface?.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
