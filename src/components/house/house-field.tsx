"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { createPointerTrail } from "@/lib/pointer-trail";
import { createDotBatch, MIN_FRAME_MS } from "@/lib/dot-batch";

/** Grid pitch in CSS pixels: the same screen as the home field and the footer glow. */
const CELL = 10;
/** How far the black pocket around `data-house-clear` text fades, in px. */
const TEXT_FEATHER = 72;
/** The still frame shown under reduced motion: several gatherings mid-life. */
const STILL_TIME = 41;

const RED = [
  "rgba(235, 0, 40, 0.22)",
  "rgba(235, 0, 40, 0.42)",
  "rgba(235, 0, 40, 0.65)",
  "rgba(235, 0, 40, 0.88)",
  "rgb(235, 0, 40)",
  "rgb(255, 107, 127)",
];
const GREY = ["rgba(133, 133, 143, 0.22)", "rgba(150, 150, 160, 0.4)", "rgba(190, 190, 198, 0.6)"];

/**
 * The gatherings. `x` and `y` are fractions of the field's box, `size` is the
 * radius in cells at full width, `period` is one gathering's whole life in
 * seconds and `offset` where in that life the page opens. Periods differ, so
 * the clusters never form and fade in step: events across a year, not a beat.
 * Each time one begins again it picks a new spot near its home.
 */
const GATHERINGS = [
  { x: 0.76, y: 0.24, size: 11, period: 19, offset: 0.35 },
  { x: 0.5, y: 0.14, size: 6, period: 23, offset: 0.7 },
  { x: 0.88, y: 0.5, size: 7, period: 17, offset: 0.1 },
  { x: 0.62, y: 0.46, size: 8, period: 27, offset: 0.55 },
  { x: 0.2, y: 0.16, size: 5, period: 21, offset: 0.9 },
  { x: 0.4, y: 0.34, size: 5, period: 25, offset: 0.2 },
  { x: 0.1, y: 0.42, size: 4, period: 29, offset: 0.45 },
] as const;
const COUNT = GATHERINGS.length;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};
/** Stable per-cell random in [0, 1). */
const hash = (i: number, j: number, k: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const SEEDS = [1, 2, 3, 7, 8, 9] as const;

type Grid = { cols: number; rows: number; seed: Record<(typeof SEEDS)[number], Float32Array> };
function buildGrid(width: number, height: number): Grid {
  const cols = Math.ceil(width / CELL) + 1;
  const rows = Math.ceil(height / CELL) + 1;
  const seed = Object.fromEntries(SEEDS.map((k) => [k, new Float32Array(cols * rows)])) as Grid["seed"];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) for (const k of SEEDS) seed[k][row * cols + col] = hash(col, row, k);
  }
  return { cols, rows, seed };
}

const redBucket = (v: number) => (v > 0.97 ? RED.length - 1 : Math.min(RED.length - 2, Math.floor(v * (RED.length - 1))));

/**
 * House's pixel field: many small gatherings. Flagship's mass is one ordered
 * thing fraying into entropy; here the order comes in small rooms. Clusters of
 * red dots on the halftone grid form out of loose grey, hold for a while and
 * come apart again, each on its own clock, like events across a year. Between
 * them a few grey strays drift. Every edge is dithered dot by dot and fades in
 * size, never in a line. The pointer pulls strays into line, as on home.
 *
 * It fills its positioned parent. Elements inside the parent marked
 * `data-house-clear` keep a soft pocket of black around them so text stays
 * legible; the field itself fades out toward the bottom of the parent. Under
 * reduced motion it draws one still frame. It stops drawing offscreen, and its
 * dots are batched into reused buffers, so nothing allocates per frame.
 */
export function HouseField({ strength = 0.9 }: { strength?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    let width = 0;
    let height = 0;
    let time = reducedMotion ? STILL_TIME : Math.random() * 100;
    let visible = true;
    let grid = buildGrid(0, 0);
    // Pockets as [left, top, right, bottom] in canvas pixels, set on layout.
    let pockets: number[][] = [];
    const trail = createPointerTrail();
    const red = createDotBatch(RED);
    const grey = createDotBatch(GREY);
    // Per-frame state of each gathering, written in place.
    const gx = new Float64Array(COUNT);
    const gy = new Float64Array(COUNT);
    const gr = new Float64Array(COUNT);
    const glife = new Float64Array(COUNT);
    const gmelt = new Float64Array(COUNT);
    const gseed = new Float64Array(COUNT);

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grid = buildGrid(width, height);
      const origin = host.getBoundingClientRect();
      pockets = Array.from(host.querySelectorAll("[data-house-clear]")).map((el) => {
        const box = el.getBoundingClientRect();
        return [box.left - origin.left, box.top - origin.top, box.right - origin.left, box.bottom - origin.top];
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (!width || !height) return;
      const t = time;
      // Gatherings are smaller on a phone, and keep their proportions.
      const scale = Math.min(1, Math.max(0.55, width / 1280));
      for (let n = 0; n < COUNT; n++) {
        const g = GATHERINGS[n];
        const phase = t / g.period + g.offset;
        const cycle = Math.floor(phase);
        const p = phase - cycle;
        // Form, hold, come apart: no step anywhere in the life.
        glife[n] = smoothstep(0.02, 0.36, p) * smoothstep(0.98, 0.62, p);
        gmelt[n] = smoothstep(0.62, 0.98, p);
        // Each round settles somewhere new near home (invisible at p = 0).
        gx[n] = (g.x + (hash(n, cycle, 4) - 0.5) * 0.14) * width;
        gy[n] = (g.y + (hash(n, cycle, 5) - 0.5) * 0.12) * height;
        gr[n] = g.size * scale * CELL * (0.85 + 0.3 * hash(n, cycle, 6));
        gseed[n] = n * 1.7;
      }

      const { cols, rows, seed } = grid;
      const { 1: h1, 2: h2, 3: h3, 7: h7, 8: h8, 9: h9 } = seed;
      const reach = Math.min(width, height) * 0.16;

      for (let row = 0; row < rows; row++) {
        const y = row * CELL;
        // The field thins out toward the bottom edge.
        const vertical = smoothstep(height, height * 0.62, y);
        if (vertical <= 0) continue;
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          // Alternate rows sit half a cell over, the halftone screen.
          const x = col * CELL + (row % 2 ? CELL / 2 : 0);

          // The strongest gathering touching this cell.
          let influence = 0;
          let melt = 0;
          let halo = 0;
          let which = -1;
          for (let n = 0; n < COUNT; n++) {
            const dx = x - gx[n];
            const dy = y - gy[n];
            const limit = gr[n] * 1.7;
            if (dx > limit || dx < -limit || dy > limit || dy < -limit) continue;
            // Uneven, breathing edge: never a circle.
            const d =
              Math.hypot(dx, dy) / gr[n] +
              0.1 * Math.sin(Math.atan2(dy, dx) * 3 + t * 0.3 + gseed[n]) +
              0.08 * (h9[i] - 0.5);
            const body = glife[n] * smoothstep(1.25, 0.3, d);
            // What the gathering leaves behind as it comes apart.
            const loose = smoothstep(1.7, 0.5, d) * (0.3 + 0.7 * gmelt[n]);
            if (loose > halo) halo = loose;
            if (body > influence) {
              influence = body;
              melt = gmelt[n];
              which = n;
            }
          }

          let clear = vertical;
          for (let k = 0; k < pockets.length; k++) {
            const pocket = pockets[k];
            const q = Math.hypot(
              Math.max(pocket[0] - x, 0, x - pocket[2]),
              Math.max(pocket[1] - y, 0, y - pocket[3]),
            );
            clear *= 1 - 0.92 * (1 - smoothstep(0, TEXT_FEATHER, q));
          }
          if (clear < 0.03) continue;

          // The pointer pulls strays into line, tapering behind it.
          const held = trail.alive ? trail.sample(x, y, reach) : 0;

          // Dithered: each dot has its own threshold, so order comes in and
          // goes out a dot at a time.
          if (influence > 0.12 + 0.7 * h3[i]) {
            const v = influence * clear;
            if (v < 0.04) continue;
            // Settling dots slip onto the grid; melting ones slip off it.
            const slip = (1 - Math.min(1, influence * 1.6)) + melt * 0.9;
            const ox = (h1[i] - 0.5) * CELL * 2.2 * slip;
            const oy = (h2[i] - 0.5) * CELL * 2.2 * slip;
            red.add(redBucket(v * 0.92), x + ox, y + oy, CELL * 0.46 * Math.pow(v, 0.85));
          } else if (held > 0.15 + 0.7 * h3[i]) {
            const v = Math.min(1, held * 0.6) * clear;
            if (v >= 0.04) red.add(redBucket(v), x, y, CELL * 0.4 * Math.pow(v, 0.85));
          } else if (halo > 0.02 && h7[i] < 0.4 * halo + 0.08) {
            // Loose grey around a gathering, drifting a little outward.
            const cyc = (t * (0.04 + h8[i] * 0.05) + h9[i]) % 1;
            const drift = cyc * CELL * 3 * halo;
            const heading = h1[i] * Math.PI * 2;
            const v = halo * (1 - cyc * 0.7) * clear * (which < 0 ? 0.8 : 1);
            if (v < 0.05) continue;
            grey.add(
              Math.min(GREY.length - 1, Math.floor(v * GREY.length)),
              x + Math.cos(heading) * drift + (h2[i] - 0.5) * CELL * 1.6,
              y + Math.sin(heading) * drift + (h1[i] - 0.5) * CELL * 1.6,
              CELL * (0.1 + 0.22 * v),
            );
          } else if (h7[i] > 0.985) {
            // Sparse strays between the gatherings, each fading in and out.
            const cyc = (t * (0.03 + h8[i] * 0.04) + h9[i]) % 1;
            const v = Math.sin(cyc * Math.PI) * 0.7 * clear;
            if (v < 0.08) continue;
            const heading = h2[i] * Math.PI * 2;
            grey.add(
              Math.min(GREY.length - 1, Math.floor(v * GREY.length)),
              x + Math.cos(heading) * cyc * CELL * 6,
              y + Math.sin(heading) * cyc * CELL * 6,
              CELL * (0.1 + 0.2 * v),
            );
          }
        }
      }

      ctx.globalAlpha = strength;
      grey.flush(ctx);
      red.flush(ctx);
    };

    let elapsed = 0;
    const tick = (_: number, deltaMs: number) => {
      elapsed += deltaMs;
      if (elapsed < MIN_FRAME_MS || !visible || document.hidden) return;
      const dt = Math.min(elapsed, 50) / 1000;
      elapsed = 0;
      time += dt;
      trail.step(dt, Math.min(width, height) * 0.04);
      draw();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = host.getBoundingClientRect();
      const inside = event.clientY >= box.top && event.clientY <= box.bottom;
      if (inside) trail.move(event.clientX - box.left, event.clientY - box.top);
      else trail.leave();
    };
    const onLeave = () => trail.leave();
    const onResize = () => {
      layout();
      draw();
    };

    layout();
    draw();
    // Pockets follow the text, which moves once the web font arrives.
    document.fonts.ready.then(onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(host);
    let io: IntersectionObserver | undefined;

    if (!reducedMotion) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(host);
      gsap.ticker.add(tick);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      observer.disconnect();
      io?.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, strength]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
