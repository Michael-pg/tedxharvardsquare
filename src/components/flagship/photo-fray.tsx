"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { createPointerTrail } from "@/lib/pointer-trail";
import { createDotBatch, MIN_FRAME_MS } from "@/lib/dot-batch";
import type { Image as ImageContent } from "@/content";

/** Grid pitch of the print, in CSS pixels: finer than the page's field, so it reads as the photo. */
const CELL = 7;
/** How much of the frame, from its inner edge, dissolves into print. Matches `mask-fray-*`. */
const STRIP = 0.34;
/** The photo inside the frame drifts at a 1.1 scale (see `TheDay`); sample it the same. */
const PHOTO_SCALE = 1.1;

const RED = [
  "rgba(235, 0, 40, 0.24)",
  "rgba(235, 0, 40, 0.45)",
  "rgba(235, 0, 40, 0.7)",
  "rgba(235, 0, 40, 0.9)",
  "rgb(235, 0, 40)",
];
const GREY = ["rgba(133, 133, 143, 0.14)", "rgba(150, 150, 160, 0.3)", "rgba(190, 190, 198, 0.5)"];

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const hash = (i: number, j: number, k: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A small copy of the photo to sample. Sanity's CDN resizes and allows CORS. */
const sampleUrl = (src: string) => (src.startsWith("https://cdn.sanity.io/") ? `${src}?w=480&fm=jpg&q=70` : src);

/** The strip's dots, worked out once per size so a frame allocates nothing. */
type Print = {
  count: number;
  /** Home position on the grid, in canvas pixels. */
  x: Float32Array;
  y: Float32Array;
  /** 0 where the strip starts inside the photo, 1 at the frame's inner edge. */
  u: Float32Array;
  /** The photo's light at the dot, contrast-stretched, 0–1. */
  ink: Float32Array;
  s1: Float32Array;
  s2: Float32Array;
  s3: Float32Array;
};

/**
 * The Day's photographs come apart at the edge that faces their text.
 *
 * The frame's inner third fades out (`mask-fray-l` / `mask-fray-r`), and in
 * its place the photo carries on as a red halftone print of itself: every
 * dot's size is the light of the picture at that point. As the row scrolls in,
 * the print is loose: its dots stream off the edge into the gutter toward the
 * words, curling like sand in a draught, going grey as they go. By the time
 * the row reaches the middle of the screen they have pulled back into register
 * and the photo is whole again, order winning out; as the row leaves, the edge
 * starts to slip once more. Even settled, the very edge never quite stops
 * shimmering. The pointer's trail combs strays back into line.
 *
 * The print is a canvas laid over the whole row (its parent's parent), so the dots can cross the
 * gutter; it stays faint and thins out before the middle of the text column,
 * so the type always reads. Phones (below `md`) stack photo and text and keep
 * the plain photo. Under reduced motion the print is drawn once, settled. If
 * the photo can't be sampled, the print falls back to an even grey texture.
 */
export function PhotoFray({ image, photoSide, salt = 1 }: { image?: ImageContent; photoSide: "left" | "right"; salt?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const src = image?.src;
  const focusX = image?.focus?.x ?? 0.5;
  const focusY = image?.focus?.y ?? 0.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    const row = canvas?.parentElement?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !row || !ctx) return;

    const wide = window.matchMedia("(min-width: 768px)");
    const dir = photoSide === "left" ? 1 : -1;
    const red = createDotBatch(RED);
    const grey = createDotBatch(GREY);
    const trail = createPointerTrail();
    const photo = new Image();

    let width = 0;
    let height = 0;
    let print: Print | null = null;
    // Canvas-space geometry: the frame's inner edge, the strip's width, and
    // where the text column starts and how wide it is.
    let edgeX = 0;
    let stripW = 0;
    let textStart = 0;
    let textW = 0;
    let time = hash(salt, 1, 2) * 100;
    // 1 is in register; the scroll sets the target and `order` eases to it.
    let order = reducedMotion ? 1 : 0;
    let target = order;
    let running = false;
    let visible = false;
    let elapsed = 0;

    const build = () => {
      print = null;
      const frame = row.querySelector<HTMLElement>("[data-frame]");
      const text = row.querySelector<HTMLElement>('[data-tile="type"]');
      if (!frame || !text || !wide.matches) return;
      const box = canvas.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      const tx = text.getBoundingClientRect();
      if (!f.width || !f.height) return;

      edgeX = (dir > 0 ? f.right : f.left) - box.left;
      stripW = f.width * STRIP;
      textStart = (dir > 0 ? tx.left : tx.right) - box.left;
      textW = tx.width;
      const top = f.top - box.top;

      // The photo as the frame shows it, at one sample per cell.
      const cols = Math.ceil(f.width / CELL);
      const rows = Math.ceil(f.height / CELL);
      let light: Uint8ClampedArray | null = null;
      if (photo.naturalWidth) {
        try {
          const scratch = document.createElement("canvas");
          scratch.width = cols;
          scratch.height = rows;
          const sctx = scratch.getContext("2d", { willReadFrequently: true });
          if (sctx) {
            const scale = Math.max(cols / photo.naturalWidth, rows / photo.naturalHeight) * PHOTO_SCALE;
            const w = photo.naturalWidth * scale;
            const h = photo.naturalHeight * scale;
            sctx.drawImage(photo, (cols - w) * focusX, (rows - h) * focusY, w, h);
            light = sctx.getImageData(0, 0, cols, rows).data;
          }
        } catch {
          // A tainted canvas (no CORS): fall through to the even texture.
          light = null;
        }
      }

      // Only the strip's columns are printed.
      const stripCols = Math.ceil(stripW / CELL);
      const firstCol = dir > 0 ? cols - stripCols : 0;
      const total = stripCols * rows;
      const next: Print = {
        count: 0,
        x: new Float32Array(total),
        y: new Float32Array(total),
        u: new Float32Array(total),
        ink: new Float32Array(total),
        s1: new Float32Array(total),
        s2: new Float32Array(total),
        s3: new Float32Array(total),
      };
      // Stretch the strip's own range, so a dark stage still prints.
      let lo = 1;
      let hi = 0;
      const lum = (col: number, row: number) => {
        if (!light) return 0.35 + 0.3 * hash(col, row, salt + 9);
        const k = (row * cols + col) * 4;
        return (light[k] * 0.299 + light[k + 1] * 0.587 + light[k + 2] * 0.114) / 255;
      };
      for (let r = 0; r < rows; r++) {
        for (let c = firstCol; c < firstCol + stripCols; c++) {
          const l = lum(c, r);
          lo = Math.min(lo, l);
          hi = Math.max(hi, l);
        }
      }
      const span = Math.max(hi - lo, 0.15);
      for (let r = 0; r < rows; r++) {
        for (let c = firstCol; c < firstCol + stripCols; c++) {
          const i = next.count++;
          const x = f.left - box.left + c * CELL + CELL / 2 + (r % 2 ? CELL / 4 : -CELL / 4);
          next.x[i] = x;
          next.y[i] = top + r * CELL + CELL / 2;
          next.u[i] = clamp01(1 - Math.abs(edgeX - x) / stripW);
          // Lifted, so the mid-tones print too, not just the highlights.
          next.ink[i] = smoothstep(0.04, 0.92, Math.pow(clamp01((lum(c, r) - lo) / span), 0.6));
          next.s1[i] = hash(c, r, salt);
          next.s2[i] = hash(c, r, salt + 1);
          next.s3[i] = hash(c, r, salt + 2);
        }
      }
      print = next;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (!print) return;
      const t = time;
      const gutter = Math.abs(textStart - edgeX);
      // Far enough to cross the gutter and slip a little way under the words.
      const travelMax = gutter + textW * 0.3;
      const reach = Math.max(80, gutter * 0.9);
      const { count, x: hx, y: hy, u, ink, s1, s2, s3 } = print;

      for (let i = 0; i < count; i++) {
        const base = ink[i];
        if (base < 0.03) continue;
        // The edge comes loose first and furthest; deeper in, only a few dots go.
        const edge = u[i];
        // Even in register the very edge keeps slipping a little, so a few
        // strays are always on their way across.
        const shimmer = edge * edge * edge * (0.16 + 0.12 * Math.sin(t * 0.8 + s2[i] * 6.283));
        let loose = clamp01((1 - order) * (0.2 + 0.8 * edge) * (0.55 + 0.9 * s1[i]) + shimmer);
        if (trail.alive) loose *= 1 - trail.sample(hx[i], hy[i], reach);

        let x = hx[i];
        let y = hy[i];
        if (loose > 0.002) {
          // Each dot rides a slow, curling draught out of the photo.
          const travel = loose * travelMax * (0.25 + 0.75 * s2[i]);
          const angle =
            0.55 * Math.sin(hy[i] * 0.011 + t * 0.35 + s3[i] * 3) + 0.3 * Math.sin(hx[i] * 0.006 - t * 0.21 + s1[i]);
          x += dir * travel * Math.cos(angle);
          y += travel * Math.sin(angle) * 0.85 + Math.sin(t * 1.1 + s1[i] * 6.283) * loose * 4;
        }

        // On the grid a dot stands in for the photo as the photo fades out; once
        // loose it is its own thing, wherever it has drifted.
        const weight = Math.max(Math.pow(edge, 0.85), smoothstep(0.05, 0.35, loose));
        // Faint before the text, gone well before the middle of it.
        const past = (x - textStart) * dir;
        const fade = smoothstep(textW * 0.32, -gutter * 0.15, past);
        const v = base * weight * fade;
        if (v < 0.04) continue;

        if (loose > 0.1 + 0.3 * s3[i]) {
          const g = v * (1 - 0.45 * loose);
          if (g < 0.04) continue;
          grey.add(Math.min(GREY.length - 1, Math.floor(g * GREY.length)), x, y, CELL * 0.32 * Math.pow(g, 0.7));
        } else {
          red.add(Math.min(RED.length - 1, Math.floor(v * RED.length)), x, y, CELL * 0.44 * Math.pow(v, 0.9));
        }
      }
      grey.flush(ctx);
      red.flush(ctx);
    };

    const tick = (_: number, deltaMs: number) => {
      elapsed += deltaMs;
      if (elapsed < MIN_FRAME_MS) return;
      const dt = Math.min(elapsed, 50) / 1000;
      elapsed = 0;
      time += dt;
      order += (target - order) * Math.min(1, dt * 2.6);
      trail.step(dt, CELL * 3);
      draw();
    };
    const start = () => {
      if (running || reducedMotion || !print) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      running = false;
      gsap.ticker.remove(tick);
    };

    // Loose as the row arrives, in register at the middle, slipping as it leaves.
    const scroll = reducedMotion
      ? null
      : ScrollTrigger.create({
          trigger: row,
          start: "top bottom",
          end: "bottom top",
          onUpdate: ({ progress }) => {
            target = smoothstep(0.08, 0.46, progress) * (1 - 0.7 * smoothstep(0.6, 1, progress));
          },
        });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = canvas.getBoundingClientRect();
      trail.move(event.clientX - box.left, event.clientY - box.top);
    };
    const onLeave = () => trail.leave();

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    const sizes = new ResizeObserver(() => {
      resize();
      draw();
      if (visible) start();
    });
    const onBreakpoint = () => {
      resize();
      draw();
    };

    photo.crossOrigin = "anonymous";
    photo.onload = photo.onerror = () => {
      build();
      draw();
      if (visible) start();
    };
    if (src) photo.src = sampleUrl(src);

    resize();
    draw();
    sizes.observe(row);
    visibility.observe(canvas);
    wide.addEventListener("change", onBreakpoint);
    if (!reducedMotion) {
      row.addEventListener("pointermove", onMove);
      row.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      scroll?.kill();
      photo.onload = photo.onerror = null;
      sizes.disconnect();
      visibility.disconnect();
      wide.removeEventListener("change", onBreakpoint);
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("pointerleave", onLeave);
    };
  }, [src, focusX, focusY, photoSide, salt, reducedMotion]);

  return (
    // Taller than the row, so dots curling up or down are never cut off.
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-12 hidden md:block">
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
