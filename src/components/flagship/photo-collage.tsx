"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";
import { cn } from "@/lib/utils";

/**
 * Where each photo sits, in order: grid placement plus a drop, so the set
 * reads as prints scattered on a table rather than a grid. Phones get a
 * simpler zigzag down four columns.
 */
const SLOTS = [
  "col-span-3 md:col-span-5 md:col-start-1",
  "col-span-3 col-start-2 md:col-span-3 md:col-start-7 md:mt-32",
  "col-span-4 md:col-span-3 md:col-start-10 md:mt-72",
  "col-span-3 md:col-span-3 md:col-start-2 md:mt-8",
  "col-span-3 col-start-2 md:col-span-6 md:col-start-6 md:mt-16",
  "col-span-4 md:col-span-4 md:col-start-1 md:mt-8",
  "col-span-3 md:col-span-3 md:col-start-6 md:mt-48",
  "col-span-3 col-start-2 md:col-span-4 md:col-start-9 md:mt-12",
  "col-span-4 md:col-span-4 md:col-start-3 md:mt-4",
  "col-span-3 md:col-span-4 md:col-start-8 md:mt-24",
];

/** How far each photo drifts against the scroll, and how crooked it starts. */
const SPEED = [0.12, -0.08, 0.2, -0.14, 0.06, 0.16, -0.1, 0.22, -0.06, 0.1];
const TILT = [-3, 2.5, -1.5, 3, -2, 1.5, -3, 2, -1, 2.5];

/**
 * Photos from past editions, in colour, scattered across the page. Each drifts
 * at its own speed as the page scrolls, and starts a little crooked, then
 * straightens as it reaches the middle of the screen: disorder settling into
 * order, the theme in a gesture. Under reduced motion they simply sit there,
 * straight.
 */
export function PhotoCollage({ images }: { images: ImageContent[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-photo]");
      items.forEach((item, i) => {
        const speed = SPEED[i % SPEED.length];
        gsap.fromTo(
          item,
          { yPercent: speed * 100, rotate: TILT[i % TILT.length] },
          {
            yPercent: -speed * 100,
            rotate: 0,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });
    },
    { scope: ref, dependencies: [reducedMotion, images.length] },
  );

  return (
    <ul ref={ref} className="grid grid-cols-4 items-start gap-x-6 gap-y-10 md:grid-cols-12 md:gap-y-6">
      {images.slice(0, SLOTS.length).map((image, i) => {
        const focus = image.focus ?? { x: 0.5, y: 0.5 };
        return (
          <li key={image.src} data-photo className={cn("relative will-change-transform", SLOTS[i])}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 1600}
              height={image.height ?? 1067}
              sizes="(min-width: 768px) 45vw, 80vw"
              style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
              className="h-auto w-full bg-ink-900"
            />
          </li>
        );
      })}
    </ul>
  );
}
