"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

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
 * theme, told without a word. The pointer pulls strays back into line, and as
 * the reader scrolls the mass grows and widens toward the footer's own glow,
 * then fades out above it so the two never meet at a hard edge.
 *
 * Page elements opt in with data attributes:
 * - `data-dot-clear` — text the field keeps a soft pocket of black around.
 *   `data-dot-clear="wide"` feathers the pocket far out, for a large picture
 *   that should sit in the field rather than be cut out of it.
 * - `data-dot-glyph` — text the field draws itself, in ordered red dots, as
 *   the element scrolls into view. The element's own text should be invisible.
 *
 * Under reduced motion it draws single still frames on scroll and resize.
 */
export function DotField() {
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
    const pointer = { x: -1e4, y: -1e4, strength: 0, target: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const collect = () => {
      clears = Array.from(document.querySelectorAll("[data-dot-clear]"));
      glyphs = Array.from(document.querySelectorAll<HTMLElement>("[data-dot-glyph]"))
        .map(buildGlyph)
        .filter((glyph): glyph is Glyph => glyph !== null);
    };

    /** The line boxes of every clearing element that is near the viewport. */
    const clearRects = () => {
      const rects: number[][] = [];
      for (const el of clears) {
        const box = el.getBoundingClientRect();
        if (box.bottom < -100 || box.top > height + 100) continue;
        if (el.getAttribute("data-dot-clear") === "wide") {
          rects.push([box.left, box.top, box.right, box.bottom, WIDE_FEATHER]);
          continue;
        }
        const range = document.createRange();
        range.selectNodeContents(el);
        for (const r of range.getClientRects()) {
          if (r.width > 2) rects.push([r.left, r.top, r.right, r.bottom, TEXT_FEATHER]);
        }
      }
      return rects;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const t = time;
      const docHeight = document.documentElement.scrollHeight;
      const progress = smoothstep(0, 1, window.scrollY / Math.max(1, docHeight - height));

      // Fade out above the footer, whose own glow takes over from here.
      const footerTop = document.querySelector("footer")?.getBoundingClientRect().top ?? Infinity;
      if (footerTop <= 0) return;

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

      const red = RED.map(() => new Path2D());
      const grey = GREY.map(() => new Path2D());
      const put = (paths: Path2D[], i: number, x: number, y: number, r: number) => {
        paths[i].moveTo(x + r, y);
        paths[i].arc(x, y, r, 0, Math.PI * 2);
      };

      const cols = Math.ceil(width / CELL) + 1;
      const rows = Math.ceil(height / CELL) + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Alternate rows sit half a cell over — the classic halftone screen.
          const gx = col * CELL + (row % 2 ? CELL / 2 : 0);
          const gy = row * CELL;
          const footerFade = smoothstep(footerTop, footerTop - height * 0.35, gy);
          if (footerFade <= 0) continue;

          // Glyphs: letterforms drawn in ordered red, cell by cell.
          let inGlyph = false;
          for (const g of activeGlyphs) {
            const lx = Math.round(gx - g.left);
            const ly = Math.round(gy - g.top);
            if (lx < 0 || ly < 0 || lx >= g.width || ly >= g.height) continue;
            if (g.alpha[ly * g.width + lx] > 128) {
              inGlyph = true;
              if (hash(col, row, 11) < g.strength) {
                const v = 0.9 * footerFade;
                put(red, redBucket(v), gx, gy, CELL * 0.44 * Math.pow(v, 0.85));
              }
            }
            break;
          }
          if (inGlyph) continue;

          const dx = (gx - cx) / stretch;
          const dy = gy - cy;
          const angle = Math.atan2(dy, dx);
          // A soft, uneven edge that breathes: never a circle, never a line.
          const d =
            Math.hypot(dx, dy) / radius +
            0.07 * Math.sin(angle * 3 + t * 0.25) +
            0.045 * Math.sin(angle * 7 - t * 0.4) +
            0.05 * Math.sin(gx * 0.004 + gy * 0.003 + t * 0.2);
          const texture = Math.sin(gx * 0.018 + gy * 0.011 + t * 0.9) * Math.sin(gy * 0.024 - t * 0.6);
          const body = smoothstep(1.02, 0.3, d) * (0.8 + 0.2 * texture);
          const dust = smoothstep(1.12, 0.95, d);
          if (body < 0.04 && dust < 0.02) continue;

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
          if (rects.length) {
            // Feathered and a little uneven, so the pocket never reads as a box.
            for (const [l, top, r, b, feather] of rects) {
              const q = Math.hypot(Math.max(l - gx, 0, gx - r), Math.max(top - gy, 0, gy - b));
              clear *= smoothstep(2, feather, q + texture * feather * 0.3);
            }
            if (clear < 0.02) continue;
          }

          const held = pointer.strength * smoothstep(reach, reach * 0.25, Math.hypot(gx - pointer.x, gy - pointer.y));
          const order = Math.max(smoothstep(0.92, 0.62, d), held);

          if (order > 0.5) {
            const v = Math.min(1, Math.max(body, held * 0.35)) * clear;
            if (v < 0.06) continue;
            const k = (order - 0.5) * 2;
            const x = gx + (hash(col, row, 1) - 0.5) * CELL * (1 - k);
            const y = gy + (hash(col, row, 2) - 0.5) * CELL * (1 - k);
            put(red, redBucket(v * 0.92), x, y, CELL * 0.46 * Math.pow(v, 0.85));
          } else {
            // The fraying edge: dots come loose and drift outward, fading.
            const loose = 1 - order * 2;
            if (hash(col, row, 7) > 0.42 - loose * 0.2) continue;
            const cycle = (t * (0.05 + hash(col, row, 8) * 0.07) + hash(col, row, 9)) % 1;
            const push = cycle * CELL * 7 * loose;
            const ux = Math.cos(angle) * stretch;
            const uy = Math.sin(angle);
            const n = Math.hypot(ux, uy) || 1;
            const x = gx + (ux / n) * push + (hash(col, row, 1) - 0.5) * CELL * 2.4 * loose;
            const y = gy + (uy / n) * push + (hash(col, row, 2) - 0.5) * CELL * 2.4 * loose;
            const v = Math.max(body, dust * 0.35) * (1 - cycle * 0.8) * clear;
            if (v < 0.05) continue;
            put(grey, Math.min(GREY.length - 1, Math.floor(v * GREY.length)), x, y, CELL * (0.1 + 0.25 * v));
          }
        }
      }

      grey.forEach((path, i) => {
        ctx.fillStyle = GREY[i];
        ctx.fill(path);
      });
      red.forEach((path, i) => {
        ctx.fillStyle = RED[i];
        ctx.fill(path);
      });
    };

    const tick = (_: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      time += dt;
      pointer.strength += (pointer.target - pointer.strength) * (1 - Math.pow(0.02, dt));
      draw();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };
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
      gsap.ticker.add(tick);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", draw);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 size-full" />;
}
