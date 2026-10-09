"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { createPointerTrail } from "@/lib/pointer-trail";
import type { Image as ImageContent } from "@/content";

/** Screen pitch of the trail, in CSS pixels. */
const CELL = 9;
/** How far around the pointer the print appears, in CSS pixels. */
const RADIUS = 80;

/** Brightness buckets, as in the halftone prints: a frame is a few filled paths. */
const BUCKETS = [
  "rgba(235, 0, 40, 0.3)",
  "rgba(235, 0, 40, 0.55)",
  "rgba(235, 0, 40, 0.8)",
  "rgb(235, 0, 40)",
  "rgb(255, 107, 127)",
];

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

const hash = (i: number, j: number, k: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Samples the photo's brightness at the trail's resolution, so bright areas
 * throw bigger pixels. Returns null if the pixels cannot be read.
 */
function sampleLuminance(img: HTMLImageElement, cols: number, rows: number) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !img.naturalWidth) return null;
    const scale = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const out = new Float32Array(cols * rows);
    for (let i = 0; i < out.length; i++) {
      out[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Event photography, black and white at rest. On hover the colour comes back
 * slowly and only part of the way, and the pointer drags a soft tail of red
 * halftone across the frame — the photo printed in the Flagship speakers' red
 * dots wherever it has just passed, each dot sized by the brightness beneath
 * it, swelling in and thinning out again with no hard edge.
 */
export function PixelPhoto({
  image,
  sizes,
  className,
  style,
}: {
  image: ImageContent;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx || reducedMotion) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let luminance: Float32Array | null = null;
    let running = false;
    const trail = createPointerTrail();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      luminance = null;
    };

    const tick = (_: number, deltaMs: number) => {
      if (!luminance) {
        const img = wrap.querySelector("img");
        if (img?.complete) luminance = sampleLuminance(img, cols, rows);
      }
      trail.step(Math.min(deltaMs, 50) / 1000, CELL * 2);
      ctx.clearRect(0, 0, width, height);
      const paths = BUCKETS.map(() => new Path2D());
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          // Alternate rows sit half a cell over — the halftone screen.
          const x = col * CELL + CELL / 2 + (row % 2 ? CELL / 4 : -CELL / 4);
          const y = row * CELL + CELL / 2;
          const e = trail.sample(x, y, RADIUS);
          if (e < 0.03) continue;
          const light = luminance ? smoothstep(0.06, 0.9, luminance[i]) : 0.6;
          const v = light * Math.min(1, e * 1.4);
          if (v < 0.05) continue;
          const r = CELL * 0.5 * Math.pow(v, 0.8);
          const bucket = v > 0.97 ? BUCKETS.length - 1 : Math.min(BUCKETS.length - 2, Math.floor(v * (BUCKETS.length - 1)));
          // Older dots drift a touch loose, so the tail frays as it fades.
          const loose = (1 - e) * CELL * 0.5;
          const px = x + (hash(col, row, 5) - 0.5) * loose;
          const py = y + (hash(col, row, 6) - 0.5) * loose;
          paths[bucket].moveTo(px + r, py);
          paths[bucket].arc(px, py, r, 0, Math.PI * 2);
        }
      }
      paths.forEach((path, i) => {
        ctx.fillStyle = BUCKETS[i];
        ctx.fill(path);
      });
      // Stop the loop once the trail has faded; the next hover restarts it.
      if (!trail.alive) stop();
    };
    const start = () => {
      if (running) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      running = false;
      gsap.ticker.remove(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      trail.move(event.clientX - rect.left, event.clientY - rect.top);
      start();
    };
    const onLeave = () => trail.leave();

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      stop();
      observer.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} style={style} className={`group relative shrink-0 overflow-hidden bg-ink-900 ${className ?? ""}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover grayscale transition-[filter] duration-slow ease-out-quart group-hover:grayscale-50"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}
