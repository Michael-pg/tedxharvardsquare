"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { HalftonePhoto } from "@/components/home/halftone-photo";
import type { Image as ImageContent } from "@/content/types";

/**
 * A speaker portrait that arrives as a print and develops into a photograph.
 * The frame first settles in as red halftone (the home page's material, see
 * `HalftonePhoto`), then, scrubbed by the scroll, the black-and-white
 * photograph lightens in over it and the dots fade away. By the time the
 * portrait reaches the middle of the screen it is just the photo, so no face
 * is ever hidden behind a hover. Scrolling back up re-prints it.
 *
 * Hover (or keyboard focus on the surrounding link, via `group`) brings the
 * colour back, as everywhere else portraits appear.
 *
 * Without JS, or under reduced motion, it is simply the photograph: the print
 * is never mounted.
 */
export function PrintedPortrait({
  image,
  sizes,
  className,
}: {
  image: ImageContent;
  sizes: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const focus = image.focus ?? { x: 0.5, y: 0.3 };

  useGSAP(
    () => {
      const photo = root.current?.querySelector<HTMLElement>("[data-photo]");
      const print = root.current?.querySelector<HTMLElement>("[data-print]");
      if (!photo) return;
      gsap.set(photo, { autoAlpha: 1 });
      if (reducedMotion || !print) return;
      gsap
        .timeline({
          // The print is held a little back: one red moment per viewport, and
          // a white studio backdrop prints as a solid block of red.
          scrollTrigger: { trigger: root.current, start: "top 90%", end: "center 55%", scrub: 0.6 },
        })
        .fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.7 }, 0.3)
        .fromTo(print, { autoAlpha: 0.8 }, { autoAlpha: 0, ease: "none", duration: 0.5 }, 0.5);
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <div ref={root} className={cn("relative aspect-4/5 overflow-hidden bg-ink-900", className)}>
      {!reducedMotion && (
        <div data-print aria-hidden="true" className="absolute inset-0">
          <HalftonePhoto
            image={{ ...image, alt: "" }}
            ratio={4 / 5}
            focus={focus}
            cell={8}
            blur={0.6}
            pointer={false}
            className="w-full"
          />
        </div>
      )}
      {/* Lightened onto the print, so while both show, the red fills the
          photo's shadows rather than sitting on top of it. */}
      <div data-photo data-animate className="absolute inset-0 mix-blend-lighten">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
          className={cn(
            "object-cover grayscale transition duration-slow ease-out-quart",
            "group-hover:scale-103 group-hover:grayscale-0 group-focus-visible:grayscale-0",
          )}
        />
      </div>
    </div>
  );
}
