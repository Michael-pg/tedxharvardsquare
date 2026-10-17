"use client";

import { useEffect, useRef } from "react";
import { createDotBatch, MIN_FRAME_MS } from "@/lib/dot-batch";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Grid pitch in CSS pixels: the same screen as the page's dot field. */
const CELL = 10;
/** Faint on purpose: the strongest red here is the dot field's second step. */
const COLORS = ["rgba(235, 0, 40, 0.16)", "rgba(235, 0, 40, 0.3)", "rgba(235, 0, 40, 0.46)", "rgba(150, 150, 160, 0.24)"];

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
/** Stable per-cell random in [0, 1). */
const hash = (i: number, j: number, k: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A patch's cells, worked out once per size so a frame allocates nothing. */
type Patch = {
  count: number;
  x: Float32Array;
  y: Float32Array;
  /** 0 at the edge of the mass, 1 at its heart. */
  mass: Float32Array;
  /** Distance from the heart, 0 to 1: the heart assembles first. */
  far: Float32Array;
  seed: Float32Array;
  /** Where a loose dot sits before it joins the grid, as an angle. */
  angle: Float32Array;
};

function buildPatch(width: number, height: number, side: "left" | "right", anchorY: number, salt: number): Patch {
  const cols = Math.ceil(width / CELL) + 1;
  const rows = Math.ceil(height / CELL) + 1;
  const cells = cols * rows;
  const patch: Patch = {
    count: 0,
    x: new Float32Array(cells),
    y: new Float32Array(cells),
    mass: new Float32Array(cells),
    far: new Float32Array(cells),
    seed: new Float32Array(cells),
    angle: new Float32Array(cells),
  };
  // The heart sits toward the outer edge, so the thick of it is beside the
  // type, not behind it; the mass is gone well before the canvas edge.
  const cx = width * (side === "right" ? 0.72 : 0.28);
  const cy = height * anchorY;
  // Inside the canvas on every side, so the mass is gone before any edge.
  const rx = Math.min(cx, width - cx) * 0.97;
  const ry = Math.min(cy, height - cy) * 0.97;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * CELL + (row % 2 ? CELL / 2 : 0);
      const y = row * CELL;
      const far = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (far >= 1) continue;
      const i = patch.count++;
      patch.x[i] = x;
      patch.y[i] = y;
      patch.far[i] = far;
      patch.mass[i] = smoothstep(0, 1, 1 - far);
      patch.seed[i] = hash(col, row, salt);
      patch.angle[i] = hash(col, row, salt + 3) * Math.PI * 2;
    }
  }
  return patch;
}

/**
 * A small, faint patch of halftone dots beside a block of text, in the page
 * dot field's material. It assembles as its row scrolls in (the heart first,
 * dots sliding onto the grid from just off it) and loosens a little as the row
 * leaves, so it breathes with the page rather than looping. Its mass thins
 * out to nothing before any edge, so there is no box, and it sits behind the
 * type, mostly beside it.
 *
 * It draws only while on screen, at most once per frame budget, into reused
 * buffers. Under reduced motion it is one still, assembled frame.
 *
 * Place it first inside a `relative` wrapper; keep the type in a `relative`
 * sibling after it.
 */
export function TextDots({
  side = "right",
  anchorY = 0.3,
  salt = 1,
}: {
  /** The side the heart leans toward: the outer edge of the text column. */
  side?: "left" | "right";
  /** Where down the patch the heart sits, 0 to 1. */
  anchorY?: number;
  /** Varies the scatter so neighbouring patches differ. */
  salt?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const batch = createDotBatch(COLORS);
    let patch = buildPatch(0, 0, side, anchorY, salt);
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let last = 0;
    // Eased toward the scroll position so a flick of the wheel does not snap.
    let assembled = reducedMotion ? 1 : 0;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      patch = buildPatch(width, height, side, anchorY, salt);
    };

    /** 0 → 1 as the row's middle rises from the foot of the screen to its middle. */
    const target = () => {
      const box = canvas.getBoundingClientRect();
      const middle = (box.top + box.height / 2) / window.innerHeight;
      const enter = smoothstep(1, 0.55, middle);
      const leave = smoothstep(0.4, 0, middle);
      return enter * (1 - 0.45 * leave);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const p = assembled;
      const { x, y, mass, far, seed, angle } = patch;
      for (let i = 0; i < patch.count; i++) {
        // The heart joins the grid first, the rim last.
        const here = smoothstep(far[i] * 0.55, far[i] * 0.55 + 0.45, p);
        if (here <= 0.01) continue;
        const loose = (1 - here) * CELL * 2.5;
        const breathe = reducedMotion ? 1 : 1 + 0.14 * Math.sin(time * 0.0007 + seed[i] * 6.283);
        const r = CELL * 0.46 * mass[i] * (0.55 + 0.45 * seed[i]) * here * breathe;
        if (r < 0.35) continue;
        const bucket = seed[i] > 0.82 && mass[i] < 0.6 ? 3 : mass[i] > 0.62 ? 2 : mass[i] > 0.3 ? 1 : 0;
        batch.add(bucket, x[i] + Math.cos(angle[i]) * loose, y[i] + Math.sin(angle[i]) * loose, r);
      }
      batch.flush(ctx);
    };

    const tick = (time: number) => {
      frame = 0;
      if (!visible) return;
      frame = requestAnimationFrame(tick);
      if (time - last < MIN_FRAME_MS) return;
      last = time;
      assembled += (target() - assembled) * 0.1;
      draw(time);
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(0);
    });
    observer.observe(canvas);

    if (reducedMotion) {
      draw(0);
      return () => observer.disconnect();
    }

    const watcher = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) {
          assembled = target();
          frame = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "80px" },
    );
    watcher.observe(canvas);

    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      watcher.disconnect();
    };
  }, [reducedMotion, side, anchorY, salt]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -inset-y-12">
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
