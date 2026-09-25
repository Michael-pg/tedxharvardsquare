"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { SpeakerWithTalk } from "@/content";

/**
 * Past speakers as a run of names in large type, like closing credits.
 * Hovering a name brings their portrait up beside the pointer in black and
 * white, revealed in hard pixel steps. Each name links to the archive entry.
 * Touch devices get the names and links only.
 */
export function SpeakerIndex({ speakers }: { speakers: SpeakerWithTalk[] }) {
  const root = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SpeakerWithTalk | null>(null);
  const reducedMotion = useReducedMotion();

  // The portrait trails the pointer while it is over the list.
  useGSAP(
    () => {
      const list = root.current;
      const el = portrait.current;
      if (!list || !el) return;
      gsap.set(el, { xPercent: -50, yPercent: -110, autoAlpha: 0 });
      const duration = reducedMotion ? 0 : 0.5;
      const toX = gsap.quickTo(el, "x", { duration, ease: "power3.out" });
      const toY = gsap.quickTo(el, "y", { duration, ease: "power3.out" });
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        toX(event.clientX);
        toY(event.clientY);
      };
      list.addEventListener("pointermove", onMove);
      return () => list.removeEventListener("pointermove", onMove);
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  // Show and hide as the hovered name changes.
  useGSAP(
    () => {
      const el = portrait.current;
      if (!el) return;
      if (!active?.headshot) {
        gsap.to(el, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
        return;
      }
      gsap.set(el, { autoAlpha: 1 });
      if (reducedMotion) return;
      // A stepped wipe, so the portrait arrives a row of pixels at a time.
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "steps(8)", overwrite: "auto" },
      );
    },
    { scope: root, dependencies: [active, reducedMotion] },
  );

  return (
    <div ref={root}>
      <ul data-dot-clear className="text-title font-medium text-ink-500 md:text-display">
        {speakers.map((speaker, i) => (
          <li key={speaker.slug} className="inline">
            {/* JSX drops whitespace between elements; without these spaces
                the whole list is one unbreakable line. */}
            <Link
              href={`/speakers#${speaker.slug}`}
              onPointerEnter={(event) => event.pointerType === "mouse" && setActive(speaker)}
              onPointerLeave={() => setActive(null)}
              className="text-ink-300 md:whitespace-nowrap transition-colors duration-fast hover:text-foreground focus-visible:text-foreground"
            >
              {speaker.name}
            </Link>
            {i < speakers.length - 1 && (
              <>
                {" "}
                <span aria-hidden="true" className="px-1">
                  /
                </span>{" "}
              </>
            )}
          </li>
        ))}
      </ul>

      <div
        ref={portrait}
        aria-hidden="true"
        className="pointer-events-none invisible fixed top-0 left-0 z-20 hidden aspect-4/5 w-48 overflow-hidden bg-ink-900 md:block"
      >
        {active?.headshot && (
          <Image key={active.slug} src={active.headshot.src} alt="" fill sizes="12rem" className="object-cover grayscale" />
        )}
      </div>
    </div>
  );
}
