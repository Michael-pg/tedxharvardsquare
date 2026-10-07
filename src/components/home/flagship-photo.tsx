"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";
import { HalftonePhoto } from "./halftone-photo";

/** Where the red plate sits against the photograph, before and after scrolling past. */
// The plate drifts right, toward the text: the photo sits at the page's left.
const PLATE_FROM = { xPercent: 24, yPercent: 5, scale: 1.35 };
const PLATE_TO = { xPercent: 14, yPercent: -2, scale: 1.35 };

/**
 * A Flagship speaker, printed twice: the photograph in black and white,
 * cropped square around the Studio hotspot, and behind it the same frame as a
 * coarse, blurred red halftone — larger, out of register, and sliced into
 * bands that scatter sideways. The photo is lightened onto the plate, so the
 * red shows through everywhere the photo is dark. As the section scrolls to
 * the middle of the screen the bands fall into line: disorder resolving to
 * order, the edition's theme, without quite reaching it.
 *
 * Works best with a lit speaker on a dark stage. Under reduced motion the
 * plate holds still, nearly in line.
 */
export function FlagshipPhoto({ image, className }: { image: ImageContent; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const focus = image.focus ?? { x: 0.5, y: 0.5 };

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

  return (
    <div ref={root} className={`relative isolate aspect-square ${className ?? ""}`}>
      <div ref={plate} className="absolute inset-0">
        <HalftonePhoto
          image={{ ...image, alt: "" }}
          className="w-full"
          ratio={1}
          focus={focus}
          cell={13}
          blur={1.6}
          scatter={120}
        />
      </div>
      <div className="mask-feather pointer-events-none absolute inset-0 mix-blend-lighten">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
          className="object-cover contrast-125 grayscale"
        />
      </div>
    </div>
  );
}
