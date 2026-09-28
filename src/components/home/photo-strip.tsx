"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";
import { PixelPhoto } from "./pixel-photo";

/**
 * The event photography as one long strip that drifts sideways while the page
 * scrolls past it — the original hero's "photos floating in", without taking
 * over the screen or locking the scroll. Heights alternate so the strip reads
 * as a contact sheet laid out by hand rather than a carousel.
 *
 * Under reduced motion the strip stays put and scrolls sideways by hand.
 */
export function PhotoStrip({ images }: { images: ImageContent[] }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = section.current;
      const row = track.current;
      if (!element || !row || reducedMotion) return;
      gsap.fromTo(
        row,
        { x: 0 },
        {
          x: () => -Math.max(0, row.scrollWidth - element.clientWidth),
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: section, dependencies: [reducedMotion, images.length] },
  );

  return (
    <div ref={section} className={reducedMotion ? "overflow-x-auto" : "overflow-hidden"}>
      <div ref={track} className="flex w-max items-start gap-6 px-6">
        {images.map((image, i) => {
          const ratio = image.width && image.height ? image.width / image.height : 3 / 2;
          return (
            <PixelPhoto
              key={image.src}
              image={image}
              sizes="(min-width: 768px) 40vw, 80vw"
              className={i % 2 ? "mt-24 h-56 md:mt-40 md:h-80" : "h-72 md:h-112"}
              // Width follows the photo's own shape; only the height is set.
              style={{ aspectRatio: String(ratio) }}
            />
          );
        })}
      </div>
    </div>
  );
}
