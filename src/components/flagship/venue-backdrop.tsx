"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { HalftonePhoto } from "@/components/home/halftone-photo";
import type { Image as ImageContent } from "@/content";

/**
 * The venue photo, full bleed, arriving the way the theme reads. It comes in
 * as a red halftone print sliced into bands knocked sideways (disorder); the
 * bands fall into register as the section rises (the pointer's trail pulls
 * them into line early), and once it fills the screen the colour photograph
 * develops through the dots and the print fades away. Scrolling back up
 * reverses it.
 *
 * Without JS, or under reduced motion, it is simply the photograph.
 */
export function VenueBackdrop({ image }: { image: ImageContent }) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const focus = image.focus ?? { x: 0.5, y: 0.5 };

  useGSAP(
    () => {
      const photo = root.current?.querySelector<HTMLElement>("[data-photo]");
      const print = root.current?.querySelector<HTMLElement>("[data-print]");
      if (!photo) return;
      gsap.set(photo, { autoAlpha: 1 });
      if (reducedMotion || !print) return;
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top 35%", end: "top top", scrub: 0.6 },
        })
        .fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.8 }, 0)
        .fromTo(print, { autoAlpha: 1 }, { autoAlpha: 0, ease: "none", duration: 0.6 }, 0.4);
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <div ref={root} className="absolute inset-0 -z-10 bg-background">
      {!reducedMotion && (
        <div data-print aria-hidden="true" className="absolute inset-0">
          <HalftonePhoto
            image={{ ...image, alt: "" }}
            focus={focus}
            cell={10}
            blur={0.4}
            scatter={160}
            exposure={3}
            className="size-full"
          />
        </div>
      )}
      {/* Lightened onto the print, so while both show the red fills the
          photo's shadows rather than sitting on top of it. */}
      <div data-photo data-animate className="absolute inset-0 mix-blend-lighten">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
          className="object-cover"
        />
      </div>
    </div>
  );
}
