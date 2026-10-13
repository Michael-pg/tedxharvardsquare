"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { createPointerTrail } from "@/lib/pointer-trail";
import { createDotBatch, MIN_FRAME_MS } from "@/lib/dot-batch";
import { INTRO, introPending } from "@/lib/intro";

/** Grid pitch in CSS pixels — the same screen as the footer glow. */
const CELL = 10;
/** How far the black pocket around `data-dot-clear` elements fades, in px. */
const TEXT_FEATHER = 48;
const WIDE_FEATHER = 140;

/** Brightness buckets, so a frame is a handful of filled paths. */
const RED = [
  "rgba(235, 0, 40, 0.22)",
  "rgba(235, 0, 40, 0.42)",
  "rgba(235, 0, 40, 0.65)",
  "rgba(235, 0, 40, 0.88)",
  "rgb(235, 0, 40)",
  "rgb(255, 107, 127)",
];
const GREY = ["rgba(133, 133, 143, 0.22)", "rgba(150, 150, 160, 0.4)", "rgba(190, 190, 198, 0.6)"];

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Stable per-cell random in [0, 1). */
const hash = (i: number, j: number, k: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
/** The per-cell `hash` seeds the draw loop reads. */
const SEEDS = [1, 2, 3, 5, 6, 7, 8, 9, 11] as const;
/**
 * Everything about a cell that never changes between frames, worked out once
 * per viewport size: its random seeds, and the sines and cosines of its
 * position in the waves that ripple the field. Each frame then rotates those
 * by the frame's time with the angle-sum identities, so the field draws
 * exactly the same dots with a fraction of the trig.
 */
type Grid = {
  cols: number;
  rows: number;
  seed: Record<(typeof SEEDS)[number], Float64Array>;
  /** gx·0.004 + gy·0.003: the slow wave along the edge. */
  edgeSin: Float64Array;
  edgeCos: Float64Array;
  /** gx·0.018 + gy·0.011 and gy·0.024: the two waves of the texture. */
  texSin: Float64Array;
  texCos: Float64Array;
  rowSin: Float64Array;
  rowCos: Float64Array;
};
function buildGrid(width: number, height: number): Grid {
  const cols = Math.ceil(width / CELL) + 1;
  const rows = Math.ceil(height / CELL) + 1;
  const cells = cols * rows;
  const seed = Object.fromEntries(SEEDS.map((k) => [k, new Float64Array(cells)])) as Grid["seed"];
  const grid: Grid = {
    cols,
    rows,
    seed,
    edgeSin: new Float64Array(cells),
    edgeCos: new Float64Array(cells),
    texSin: new Float64Array(cells),
    texCos: new Float64Array(cells),
    rowSin: new Float64Array(rows),
    rowCos: new Float64Array(rows),
  };
  for (let row = 0; row < rows; row++) {
    const gy = row * CELL;
    grid.rowSin[row] = Math.sin(gy * 0.024);
    grid.rowCos[row] = Math.cos(gy * 0.024);
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const gx = col * CELL + (row % 2 ? CELL / 2 : 0);
      for (const k of SEEDS) seed[k][i] = hash(col, row, k);
      grid.edgeSin[i] = Math.sin(gx * 0.004 + gy * 0.003);
      grid.edgeCos[i] = Math.cos(gx * 0.004 + gy * 0.003);
      grid.texSin[i] = Math.sin(gx * 0.018 + gy * 0.011);
      grid.texCos[i] = Math.cos(gx * 0.018 + gy * 0.011);
    }
  }
  return grid;
}
/** How far the three ripples in `d` can move it, at most. */
const RIPPLE = 0.07 + 0.045 + 0.05;

const redBucket = (v: number) => (v > 0.97 ? RED.length - 1 : Math.min(RED.length - 2, Math.floor(v * (RED.length - 1))));

type Glyph = { el: HTMLElement; width: number; height: number; alpha: Uint8ClampedArray };

/**
 * Draws a text element's glyphs into an alpha mask, positioned exactly where
 * the browser laid them out, so the field can fill the letterforms with dots.
 */
function buildGlyph(el: HTMLElement): Glyph | null {
  const box = el.getBoundingClientRect();
  const width = Math.ceil(box.width);
  const height = Math.ceil(box.height);
  if (!width || !height) return null;
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const style = getComputedStyle(el);
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = style.letterSpacing;
  ctx.fillStyle = "#fff";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    const metrics = ctx.measureText(text);
    ctx.fillText(text, rect.left - box.left, rect.top - box.top + metrics.fontBoundingBoxAscent);
  }
  const data = ctx.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  return { el, width, height, alpha };
}

/**
 * The home page's one dot layer: a fixed canvas behind everything, so there is
 * never a seam between sections.
 *
 * A soft halftone mass rises from the lower right — the footer glow's
 * material, with its gradient made only of dot size and plenty of black
 * around it. Its core is order: red, on the grid. Its edge keeps coming loose:
 * dots slip off the grid, go grey and drift outward. That is the Edition 3
 * theme, told without a word. Nothing about the edge is a line: dot size,
 * colour and order all fall off gradually, and the switch from red to loose
 * grey is dithered dot by dot. The pointer drags a tapering trail that pulls
 * strays back into line. As the reader scrolls the mass grows and widens, then
 * fades out above the first `data-dot-stop` section (or the footer, whose own
 * glow takes over), so the two never meet at a hard edge.
 *
 * Page elements opt in with data attributes:
 * - `data-dot-clear` — text the field keeps a soft pocket of black around.
 *   `data-dot-clear="wide"` feathers the pocket far out, for a large picture
 *   that should sit in the field rather than be cut out of it.
 * - `data-dot-stop` — a section the field fades out above and stays out of,
 *   for a passage that should sit on plain black down to the footer.
 * - `data-dot-glyph` — text the field draws itself, in ordered red dots, as
 *   the element scrolls into view. The element's own text should be invisible.
 *
 * `strength` (0–1) fades the whole field, for pages where it should sit
 * further back than on home. Opaque sections above it simply cover it.
 *
 * `intro` makes the field part of home's loader (see `INTRO`): when it plays,
 * the dots start scattered and pull themselves into order, the core first and
 * the fraying edge last. Otherwise the field is simply there, settled.
 *
 * Under reduced motion it draws single still frames on scroll and resize, and
 * skips the intro.
 */
export function DotField({ strength = 1, intro = false }: { strength?: number; intro?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let time = Math.random() * 100;
    let clears: Element[] = [];
    let glyphs: Glyph[] = [];
    let grid = buildGrid(0, 0);
    const trail = createPointerTrail();
    // One range, re-pointed at each clearing element every frame.
    const range = document.createRange();
    // The clearing pockets that reach the row being drawn; reused every row.
    const rowPockets: number[][] = [];
    const red = createDotBatch(RED);
    const grey = createDotBatch(GREY);
    // 0 → 1 over the intro; 1 is the settled field.
    const gather = { progress: intro && !reducedMotion && introPending() ? 0 : 1 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grid = buildGrid(width, height);
    };
    const collect = () => {
      clears = Array.from(document.querySelectorAll("[data-dot-clear]"));
      glyphs = Array.from(document.querySelectorAll<HTMLElement>("[data-dot-glyph]"))
        .map(buildGlyph)
        .filter((glyph): glyph is Glyph => glyph !== null);
    };

    /**
     * The line boxes of every clearing element that is near the viewport, with
     * the element's opacity, so a pocket fades in with its text rather than
     * waiting, empty, for text still to arrive.
     */
    const clearRects = () => {
      const rects: number[][] = [];
      for (const el of clears) {
        const box = el.getBoundingClientRect();
        if (box.bottom < -100 || box.top > height + 100) continue;
        const style = getComputedStyle(el);
        const shown = style.visibility === "hidden" ? 0 : Number(style.opacity);
        if (shown < 0.01) continue;
        if (el.getAttribute("data-dot-clear") === "wide") {
          rects.push([box.left, box.top, box.right, box.bottom, WIDE_FEATHER, shown]);
          continue;
        }
        range.selectNodeContents(el);
        for (const r of range.getClientRects()) {
          if (r.width > 2) rects.push([r.left, r.top, r.right, r.bottom, TEXT_FEATHER, shown]);
        }
      }
      return rects;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // A zero-size viewport (a hidden or collapsed window) gives the mass a
      // zero radius, and every dot a NaN size.
      if (!width || !height) return;
      const t = time;
      const docHeight = document.documentElement.scrollHeight;
      const progress = smoothstep(0, 1, window.scrollY / Math.max(1, docHeight - height));

      // Fade out above the first plain-black section, or the footer, whose own
      // glow takes over from here.
      const stopTop = document.querySelector("[data-dot-stop], footer")?.getBoundingClientRect().top ?? Infinity;
      if (stopTop <= 0) return;

      // The mass: anchored lower right, drifting toward a wide, low glow.
      const cx = lerp(width * 1.02, width * 0.55, progress);
      const cy = lerp(height * 1.08, height * 1.32, progress);
      const radius = Math.max(width, height) * lerp(0.6, 0.82, progress);
      const stretch = lerp(1, 1.9, progress);
      const reach = Math.min(width, height) * 0.2;

      const rects = clearRects();
      const activeGlyphs = glyphs
        .map((glyph) => {
          const box = glyph.el.getBoundingClientRect();
          // Assembles as the element rises from the bottom of the screen.
          const strength = reducedMotion ? 1 : smoothstep(height * 0.98, height * 0.4, box.top);
          return { ...glyph, left: box.left, top: box.top, strength };
        })
        .filter((g) => g.strength > 0 && g.top < height && g.top + g.height > 0);

      const { cols, rows, seed, edgeSin, edgeCos, texSin, texCos, rowSin, rowCos } = grid;
      const [h1, h2, h3, h5, h6, h7, h8, h9, h11] = SEEDS.map((k) => seed[k]);
      // The time half of every wave, once per frame.
      const sinA = Math.sin(t * 0.25);
      const cosA = Math.cos(t * 0.25);
      const sinB = Math.sin(t * 0.4);
      const cosB = Math.cos(t * 0.4);
      const sinE = Math.sin(t * 0.2);
      const cosE = Math.cos(t * 0.2);
      const sinT = Math.sin(t * 0.9);
      const cosT = Math.cos(t * 0.9);
      const sinR = Math.sin(t * 0.6);
      const cosR = Math.cos(t * 0.6);
      // Past this distance no ripple can bring a dot back into the field.
      const reachLimit = (1.45 + RIPPLE) * radius;
      // A pocket only touches dots within 1.3 feathers of its box (the feather
      // plus the texture's ±0.3 wobble); everywhere else it multiplies by
      // exactly 1. So each row only tests the pockets that reach it, and each
      // dot skips a pocket it is clear of on either axis.
      for (let row = 0; row < rows; row++) {
        const gy = row * CELL;
        rowPockets.length = 0;
        for (const rect of rects) {
          const pad = rect[4] * 1.3;
          if (gy >= rect[1] - pad && gy <= rect[3] + pad) rowPockets.push(rect);
        }
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          // Alternate rows sit half a cell over — the classic halftone screen.
          const gx = col * CELL + (row % 2 ? CELL / 2 : 0);
          const footerFade = smoothstep(stopTop, stopTop - height * 0.4, gy);
          if (footerFade <= 0) continue;

          // Glyphs: letterforms drawn in ordered red, cell by cell.
          let inGlyph = false;
          for (const g of activeGlyphs) {
            const lx = Math.round(gx - g.left);
            const ly = Math.round(gy - g.top);
            if (lx < 0 || ly < 0 || lx >= g.width || ly >= g.height) continue;
            if (g.alpha[ly * g.width + lx] > 128) {
              inGlyph = true;
              if (h11[i] < g.strength) {
                const v = 0.9 * footerFade;
                red.add(redBucket(v), gx, gy, CELL * 0.44 * Math.pow(v, 0.85));
              }
            }
            break;
          }
          if (inGlyph) continue;

          const dx = (gx - cx) / stretch;
          const dy = gy - cy;
          const r = Math.hypot(dx, dy);
          if (r > reachLimit) continue;
          // The cell's direction from the centre as a unit vector, and its
          // 3rd and 7th harmonics by complex multiplication: what
          // sin(angle · 3 + …) and sin(angle · 7 − …) need, without atan2.
          const c1 = r ? dx / r : 1;
          const s1 = r ? dy / r : 0;
          const c2 = c1 * c1 - s1 * s1;
          const s2 = 2 * c1 * s1;
          const c3 = c2 * c1 - s2 * s1;
          const s3 = s2 * c1 + c2 * s1;
          const c4 = c2 * c2 - s2 * s2;
          const s4 = 2 * c2 * s2;
          const c7 = c4 * c3 - s4 * s3;
          const s7 = s4 * c3 + c4 * s3;
          // A soft, uneven edge that breathes: never a circle, never a line.
          //   0.07  · sin(angle · 3 + t · 0.25)
          //   0.045 · sin(angle · 7 − t · 0.4)
          //   0.05  · sin(gx · 0.004 + gy · 0.003 + t · 0.2)
          const d =
            r / radius +
            0.07 * (s3 * cosA + c3 * sinA) +
            0.045 * (s7 * cosB - c7 * sinB) +
            0.05 * (edgeSin[i] * cosE + edgeCos[i] * sinE);
          // sin(gx · 0.018 + gy · 0.011 + t · 0.9) · sin(gy · 0.024 − t · 0.6)
          const texture = (texSin[i] * cosT + texCos[i] * sinT) * (rowSin[row] * cosR - rowCos[row] * sinR);
          // Dots shrink well past where they used to stop, so the mass thins
          // out into the black instead of ending at a rim.
          const body = Math.pow(smoothstep(1.32, 0.32, d), 1.25) * (0.8 + 0.2 * texture);
          const dust = smoothstep(1.45, 1.0, d);
          if (body < 0.04 && dust < 0.02) continue;

          // The intro: each dot arrives from a scattered start, the core
          // settling first and order spreading outward to the edge.
          let arrive = 1;
          let sx = 0;
          let sy = 0;
          if (gather.progress < 1) {
            const start = Math.min(1, d / 1.3) * 0.5 + h5[i] * 0.2;
            arrive = smoothstep(start, start + 0.3, gather.progress);
            if (arrive <= 0) continue;
            const scatter = (1 - arrive) * (1 - arrive) * CELL * 14;
            const heading = h6[i] * Math.PI * 2;
            sx = Math.cos(heading) * scatter;
            sy = Math.sin(heading) * scatter;
          }

          let clear = footerFade;
          // Keep the mass out from behind a glyph so the number reads on black.
          for (const g of activeGlyphs) {
            const q = Math.hypot(
              Math.max(g.left - gx, 0, gx - g.left - g.width),
              Math.max(g.top - gy, 0, gy - g.top - g.height),
            );
            clear *= 1 - g.strength * smoothstep(80, 0, q);
          }
          if (clear < 0.02) continue;
          if (rowPockets.length) {
            // Feathered and a little uneven, so a text pocket never reads as a
            // box. Wide pockets stay smooth: the texture is fixed to the screen,
            // so on a pocket that large it slid along the edge while scrolling.
            for (const [l, top, r, b, feather, shown] of rowPockets) {
              if (gx < l - feather * 1.3 || gx > r + feather * 1.3) continue;
              const q = Math.hypot(Math.max(l - gx, 0, gx - r), Math.max(top - gy, 0, gy - b));
              const wobble = feather === WIDE_FEATHER ? 0 : texture * feather * 0.3;
              clear *= 1 - shown * (1 - smoothstep(2, feather, q + wobble));
            }
            if (clear < 0.02) continue;
          }

          // The pointer's trail pulls strays back into line, tapering behind it.
          const held = trail.sample(gx, gy, reach);
          const order = Math.max(smoothstep(1.18, 0.62, d), held);

          // Dithered: each dot has its own threshold, so red gives way to
          // loose grey a dot at a time rather than along a line.
          if (order > 0.15 + 0.7 * h3[i]) {
            const v = Math.min(1, Math.max(body, held * 0.35)) * clear;
            if (v < 0.04) continue;
            const k = Math.min(1, order * 1.4);
            const x = gx + sx + (h1[i] - 0.5) * CELL * (1 - k);
            const y = gy + sy + (h2[i] - 0.5) * CELL * (1 - k);
            red.add(redBucket(v * 0.92), x, y, CELL * 0.46 * Math.pow(v, 0.85) * arrive);
          } else {
            // The fraying edge: dots come loose and drift outward, fading.
            const loose = 1 - order;
            if (h7[i] > 0.42 - loose * 0.2) continue;
            const cycle = (t * (0.05 + h8[i] * 0.07) + h9[i]) % 1;
            const push = cycle * CELL * 7 * loose;
            const ux = c1 * stretch;
            const uy = s1;
            const n = Math.hypot(ux, uy) || 1;
            const x = gx + sx + (ux / n) * push + (h1[i] - 0.5) * CELL * 2.4 * loose;
            const y = gy + sy + (uy / n) * push + (h2[i] - 0.5) * CELL * 2.4 * loose;
            const v = Math.max(body, dust * 0.35) * (1 - cycle * 0.8) * clear * arrive;
            if (v < 0.05) continue;
            grey.add(Math.min(GREY.length - 1, Math.floor(v * GREY.length)), x, y, CELL * (0.1 + 0.25 * v));
          }
        }
      }

      ctx.globalAlpha = strength;
      grey.flush(ctx);
      red.flush(ctx);
    };

    let elapsed = 0;
    const tick = (_: number, deltaMs: number) => {
      // Full-screen redraws are the costly part, so a 120 Hz display draws
      // every other frame; the motion is slow enough not to show it.
      elapsed += deltaMs;
      if (elapsed < MIN_FRAME_MS) return;
      const dt = Math.min(elapsed, 50) / 1000;
      elapsed = 0;
      time += dt;
      trail.step(dt, Math.min(width, height) * 0.04);
      draw();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      trail.move(event.clientX, event.clientY);
    };
    const onLeave = () => trail.leave();
    const onResize = () => {
      resize();
      collect();
      draw();
    };

    resize();
    collect();
    draw();
    // Glyph masks depend on the web font; rebuild once it has loaded.
    document.fonts.ready.then(() => {
      collect();
      draw();
    });
    window.addEventListener("resize", onResize);

    if (reducedMotion) {
      window.addEventListener("scroll", draw, { passive: true });
    } else {
      if (gather.progress < 1) gsap.to(gather, { progress: 1, duration: INTRO.gather, ease: "power2.out" });
      gsap.ticker.add(tick);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      gsap.killTweensOf(gather);
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", draw);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, strength, intro]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 size-full" />;
}
