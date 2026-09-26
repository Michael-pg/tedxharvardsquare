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
 * not otherwise need it. It only animates while on screen and `active`, and
 * draws a single still frame under reduced motion.
 *
 * The menu reuses it at the foot of its panel: `className` places the field,
 * and `active` pauses it while the panel is closed (a hidden fixed panel still
 * counts as on screen).
 */
export function FooterGlow({
  className = "absolute inset-x-0 -top-40 bottom-0 md:-top-64",
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
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
        // Height of the horizon in pixels from the bottom. It scales with
        // width, not canvas height, so the body of the glow sits behind the
        // lower half of the lockup (whose height also tracks width) at every
        // breakpoint — and never behind the red TEDx mark.
        const horizon = 45 + width * 0.13 + wave * (20 + width * 0.07);

        for (let row = 0; row < rows; row++) {
          // Offset alternate rows by half a cell — the classic halftone screen.
          const px = x + (row % 2 ? CELL / 2 : 0);
          const py = row * CELL;
          const fromBottom = 1 - py / height;
          const fromBottomPx = height - py;

          const texture =
            Math.sin(px * 0.018 + py * 0.011 + t * 0.9) * Math.sin(py * 0.024 - t * 0.6);
          // The body of the glow, with fine texture so it breathes instead of
          // sitting flat.
          let intensity =
            smoothstep(horizon + 40 + width * 0.1, horizon - 40 - width * 0.12, fromBottomPx) *
            (0.78 + 0.22 * texture);
          // A faint, broken tail of tiny dots that reaches up toward the links.
          // `max` rather than `+`, so the tail never brightens the body.
          intensity = Math.max(
            intensity,
            0.32 * smoothstep(0.98, 0.35, fromBottom) * Math.max(0, 0.4 + 0.6 * texture),
          );

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
            intensity > 0.99
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
      if (running || reducedMotion || !visible || !active) return;
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

    // The canvas sits behind its content, so listen on the footer or menu panel.
    const surface = canvas.closest<HTMLElement>("footer, [role=dialog]") ?? canvas.parentElement;
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
  }, [reducedMotion, active]);

  return (
    // A canvas will not stretch between `top` and `bottom` the way a div does,
    // so a wrapper takes the offsets and the canvas fills it.
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
