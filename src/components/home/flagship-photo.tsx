"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";
import { HalftonePhoto } from "./halftone-photo";

/** Where the red plate sits against the photograph, before and after scrolling past. */
const PLATE_FROM = { xPercent: -14, yPercent: 6, scale: 1.1 };
const PLATE_TO = { xPercent: -6, yPercent: -3, scale: 1.1 };

/**
 * A Flagship speaker, printed twice: the photograph in black and white, and
 * behind it the same frame in red halftone, larger and knocked out of
 * register. The photo is lightened onto the plate, so the red shows through
 * everywhere the photo is dark — the stage, the shadows, the speaker's echo
 * beside them. As the section scrolls past, the plate slides toward register
 * without ever quite reaching it.
 *
 * Works best with a lit speaker on a dark stage. Under reduced motion the
 * plate holds its offset still.
 */
export function FlagshipPhoto({ image, className }: { image: ImageContent; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = root.current;
      const layer = plate.current;
      if (!element || !layer) return;
      if (reducedMotion) {
        gsap.set(layer, PLATE_TO);
        return;
      }
      gsap.fromTo(layer, PLATE_FROM, {
        ...PLATE_TO,
        ease: "none",
        scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  const ratio = image.width && image.height ? image.width / image.height : 3 / 2;
  return (
    <div ref={root} style={{ aspectRatio: String(ratio) }} className={`relative isolate ${className ?? ""}`}>
      <div ref={plate} className="absolute inset-0">
        <HalftonePhoto image={{ ...image, alt: "" }} className="w-full" />
      </div>
      <div className="mask-feather pointer-events-none absolute inset-0 mix-blend-lighten">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover contrast-125 grayscale"
        />
      </div>
    </div>
  );
}
