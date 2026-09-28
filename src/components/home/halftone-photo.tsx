"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";

/** Brightness buckets, as in the footer glow: a frame is a few filled paths. */
const BUCKETS = [
  "rgba(235, 0, 40, 0.3)",
  "rgba(235, 0, 40, 0.5)",
  "rgba(235, 0, 40, 0.7)",
  "rgba(235, 0, 40, 0.9)",
  "rgb(235, 0, 40)",
  "rgb(255, 107, 127)",
];

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

const hash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A small copy of the photo to sample. Sanity's CDN resizes and allows CORS. */
const sampleUrl = (src: string) =>
  src.startsWith("https://cdn.sanity.io/") ? `${src}?w=480&fm=jpg&q=70` : src;

/**
 * A photograph printed entirely in red halftone — the footer glow's material,
 * with a picture in it. The photo itself is never shown: every dot's size is
 * the brightness of the photo beneath it. The dots settle in from the top as
 * the frame first scrolls into view, and swell under the pointer.
 *
 * Under reduced motion it draws the finished print once. The element carries
 * the photo's alt text, since the canvas has none of its own.
 */
export function HalftonePhoto({ image, className }: { image: ImageContent; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let cell = 8;
    let cols = 0;
    let rows = 0;
    let luminance: Float32Array | null = null;
    let running = false;
    let revealed = false;
    const photo = new Image();
    const state = { progress: reducedMotion ? 1 : 0 };
    const pointer = { x: 0, y: 0, strength: 0, target: 0 };

    const sample = () => {
      if (!photo.naturalWidth || !cols) return;
      try {
        const scratch = document.createElement("canvas");
        scratch.width = cols;
        scratch.height = rows;
        const sctx = scratch.getContext("2d", { willReadFrequently: true });
        if (!sctx) return;
        // Cover-fit, like `object-cover`.
        const scale = Math.max(cols / photo.naturalWidth, rows / photo.naturalHeight);
        const w = photo.naturalWidth * scale;
        const h = photo.naturalHeight * scale;
        sctx.drawImage(photo, (cols - w) / 2, (rows - h) / 2, w, h);
        const data = sctx.getImageData(0, 0, cols, rows).data;
        luminance = new Float32Array(cols * rows);
        for (let i = 0; i < luminance.length; i++) {
          luminance[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
        }
      } catch {
        luminance = null;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = width < 500 ? 6 : 8;
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      sample();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (!luminance) return;
      const paths = BUCKETS.map(() => new Path2D());
      const reach = Math.max(width, height) * 0.18;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Settle in from the top, each dot a little early or late.
          const delay = (row / rows) * 0.6 + hash(col, row) * 0.3;
          const shown = smoothstep(delay, delay + 0.1, state.progress);
          if (shown <= 0) continue;
          // A touch of contrast so shadows fall away to black.
          let intensity = smoothstep(0.08, 0.92, luminance[row * cols + col]);
          const x = col * cell + cell / 2 + (row % 2 ? cell / 4 : -cell / 4);
          const y = row * cell + cell / 2;
          // The print thins out toward its edges, so it has no frame.
          const edge = Math.min(x, width - x, y, height - y);
          intensity *= smoothstep(0, Math.min(width, height) * 0.14, edge);
          if (pointer.strength > 0.01) {
            const d = Math.hypot(x - pointer.x, y - pointer.y);
            const falloff = 1 - Math.min(d / reach, 1);
            intensity += falloff * falloff * 0.45 * pointer.strength;
          }
          intensity = Math.min(intensity, 1) * shown;
          if (intensity < 0.06) continue;
          const radius = cell * 0.5 * Math.pow(intensity, 0.8);
          const bucket =
            intensity > 0.97
              ? BUCKETS.length - 1
              : Math.min(BUCKETS.length - 2, Math.floor(intensity * (BUCKETS.length - 1)));
          paths[bucket].moveTo(x + radius, y);
          paths[bucket].arc(x, y, radius, 0, Math.PI * 2);
        }
      }
      paths.forEach((path, i) => {
        ctx.fillStyle = BUCKETS[i];
        ctx.fill(path);
      });
    };

    // Runs only while the reveal plays or the pointer's swell is fading.
    const tick = (_: number, deltaMs: number) => {
      const follow = 1 - Math.pow(0.002, Math.min(deltaMs, 50) / 1000);
      pointer.strength += (pointer.target - pointer.strength) * follow;
      draw();
      const settled = state.progress >= 1 && pointer.target === 0 && pointer.strength < 0.01;
      if (settled) stop();
    };
    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      running = false;
      gsap.ticker.remove(tick);
    };

    const reveal = () => {
      if (revealed || reducedMotion || !luminance) return;
      revealed = true;
      gsap.to(state, { progress: 1, duration: 2.4, ease: "power2.out" });
      start();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.target = 1;
      start();
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    let visible = false;
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) reveal();
      },
      { threshold: 0.25 },
    );

    photo.crossOrigin = "anonymous";
    photo.onload = () => {
      sample();
      draw();
      if (visible) reveal();
    };
    photo.src = sampleUrl(image.src);

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(wrap);
    intersection.observe(wrap);
    if (!reducedMotion) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      gsap.killTweensOf(state);
      photo.onload = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [image.src, reducedMotion]);

  const ratio = image.width && image.height ? image.width / image.height : 3 / 2;
  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={image.alt || undefined}
      aria-hidden={image.alt ? undefined : true}
      // The page's dot field keeps a soft pocket of black around the print.
      data-dot-clear="wide"
      style={{ aspectRatio: String(ratio) }}
      className={`relative ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
