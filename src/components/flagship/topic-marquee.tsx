"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Topic } from "@/content";

const ROWS = 3;
/** Seconds for one row to travel its own length. Slow: this is texture, not news. */
const LOOP_SECONDS = 60;

/**
 * The topics as three rows of large type sliding past in alternating
 * directions. Each row is printed twice end to end and moved by half its
 * width, so the loop has no seam. Screen readers get the plain list instead.
 * Under reduced motion the rows hold still and wrap.
 */
export function TopicMarquee({ topics }: { topics: Topic[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const perRow = Math.ceil(topics.length / ROWS);
  const rows = Array.from({ length: ROWS }, (_, i) => topics.slice(i * perRow, (i + 1) * perRow)).filter(
    (row) => row.length > 0,
  );

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row, i) => {
        const leftward = i % 2 === 0;
        gsap.fromTo(
          row,
          { xPercent: leftward ? 0 : -50 },
          { xPercent: leftward ? -50 : 0, duration: LOOP_SECONDS, ease: "none", repeat: -1 },
        );
      });
    },
    { scope: ref, dependencies: [reducedMotion, topics.length] },
  );

  return (
    <>
      <ul className="sr-only">
        {topics.map((topic) => (
          <li key={topic.slug}>{topic.label}</li>
        ))}
      </ul>
      <div ref={ref} aria-hidden className="flex flex-col gap-2 overflow-x-clip py-2">
        {rows.map((row, i) => (
          <div
            key={i}
            data-row
            className={
              reducedMotion ? "flex flex-wrap px-6" : "flex w-max whitespace-nowrap will-change-transform"
            }
          >
            {(reducedMotion ? [row] : [row, row]).map((copy, j) => (
              <span key={j} className="text-display font-medium text-ink-300">
                {copy.map((topic) => (
                  <span key={topic.slug}>
                    {topic.label}
                    <span className="px-4 text-brand md:px-6">/</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
