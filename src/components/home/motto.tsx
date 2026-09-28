"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const Words = ({ text }: { text: string }) =>
  text.split(" ").map((word, j) => (
    <span key={j} data-word>
      {j > 0 ? " " : ""}
      {word}
    </span>
  ));

/**
 * The motto as one statement, one colour, with its answer set smaller beneath
 * it. Words start dim and light up in reading order as the motto scrolls
 * through the viewport — scrubbed, so it tracks the reader instead of playing
 * on its own, and never pinned.
 *
 * Without JS, or under reduced motion, every word is simply lit.
 */
export function Motto({ lines, coda }: { lines: string[]; coda?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || reducedMotion) return;
      gsap.fromTo(
        element.querySelectorAll("[data-word]"),
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: element, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        },
      );
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <div ref={ref}>
      <p data-dot-clear className="text-statement font-medium">
        {lines.map((line, i) => (
          <span key={i} className="block">
            <Words text={line} />
          </span>
        ))}
      </p>
      {coda && (
        <p data-dot-clear className="mt-10 max-w-4xl text-display font-medium text-balance md:mt-16">
          <Words text={coda} />
        </p>
      )}
    </div>
  );
}
