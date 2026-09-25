"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";

/** Pixel size of the trail, in CSS pixels. */
const CELL = 12;
const RADIUS = 70;

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
 * slowly and only part of the way, and a trail of red square pixels follows
 * the pointer across the frame and decays behind it — the dot system meeting
 * the photograph.
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
    let energy = new Float32Array(0);
    let luminance: Float32Array | null = null;
    let running = false;
    const pointer = { x: 0, y: 0, inside: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      energy = new Float32Array(cols * rows);
      luminance = null;
    };

    const tick = () => {
      if (!luminance) {
        const img = wrap.querySelector("img");
        if (img?.complete) luminance = sampleLuminance(img, cols, rows);
      }
      let alive = false;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#eb0028";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          if (pointer.inside) {
            const d = Math.hypot(col * CELL + CELL / 2 - pointer.x, row * CELL + CELL / 2 - pointer.y);
            if (d < RADIUS) energy[i] = Math.max(energy[i], 1 - d / RADIUS);
          }
          energy[i] *= 0.94;
          const e = energy[i];
          if (e < 0.04) continue;
          alive = true;
          const light = luminance ? luminance[i] : 0.6;
          const size = CELL * (0.3 + 0.7 * light) * Math.min(1, e * 1.6);
          const jx = (hash(col, row, 5) - 0.5) * CELL * 1.6 * e;
          const jy = (hash(col, row, 6) - 0.5) * CELL * 0.8 * e;
          ctx.globalAlpha = Math.min(1, e * 1.3);
          ctx.fillRect(col * CELL + (CELL - size) / 2 + jx, row * CELL + (CELL - size) / 2 + jy, size, size);
        }
      }
      ctx.globalAlpha = 1;
      // Stop the loop once the trail has faded; the next hover restarts it.
      if (!alive && !pointer.inside) stop();
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
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.inside = true;
      start();
    };
    const onLeave = () => {
      pointer.inside = false;
    };

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
