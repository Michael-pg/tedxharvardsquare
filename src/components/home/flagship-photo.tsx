"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";
import { HalftonePhoto } from "./halftone-photo";

/**
 * A Flagship speaker that arrives the way portraits do on the speakers page
 * (`PrintedPortrait`): the frame settles in as red halftone, then, scrubbed by
 * the scroll, the black-and-white photograph develops over it and the dots
 * fade away. Once developed, the pointer brushes the print back into view
 * along a small, tapering trail.
 *
 * Every layer is feathered at its edges and the photo is lightened onto the
 * page, so its blacks are the page's black and the frame never shows. Under
 * reduced motion, or without JS, it is simply the photograph.
 *
 * Works best with a lit speaker on a dark stage.
 */
export function FlagshipPhoto({ image, className }: { image: ImageContent; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const focus = image.focus ?? { x: 0.5, y: 0.5 };
  const print = { ...image, alt: "" };

  useGSAP(
    () => {
      const photo = root.current?.querySelector<HTMLElement>("[data-photo]");
      const plate = root.current?.querySelector<HTMLElement>("[data-print]");
      if (!photo) return;
      gsap.set(photo, { autoAlpha: 1 });
      if (reducedMotion || !plate) return;
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 50%", scrub: 0.6 },
        })
        .fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.7 }, 0.3)
        .fromTo(plate, { autoAlpha: 0.9 }, { autoAlpha: 0, ease: "none", duration: 0.5 }, 0.5);
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    // Not isolated: the photo lightens onto the page itself, so its blacks
    // become the page's black.
    <div ref={root} className={`relative aspect-square ${className ?? ""}`}>
      {!reducedMotion && (
        <div data-print aria-hidden="true" className="mask-feather absolute inset-0">
          <HalftonePhoto image={print} ratio={1} focus={focus} cell={9} blur={0.6} pointer={false} className="w-full" />
        </div>
      )}
      <div data-photo data-animate className="mask-feather pointer-events-none absolute inset-0 mix-blend-lighten">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
          className="object-cover contrast-125 grayscale"
        />
      </div>
      {!reducedMotion && (
        <div aria-hidden="true" className="mask-feather absolute inset-0">
          <HalftonePhoto image={print} ratio={1} focus={focus} cell={7} trail className="w-full" />
        </div>
      )}
    </div>
  );
}
