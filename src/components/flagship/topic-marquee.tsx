"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Topic } from "@/content";

/** Seconds for the row to travel its own length. Slow: this is texture, not news. */
const LOOP_SECONDS = 90;

/**
 * The topics as one band of type sliding past between hairlines: a
 * transition between Speakers and the venue rather than a section of its own.
 * The row is printed twice end to end and moved by half its width, so the
 * loop has no seam. Screen readers get a heading and the plain list instead.
 * Under reduced motion the row holds still and wraps.
 */
export function TopicMarquee({ topics }: { topics: Topic[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo("[data-row]", { xPercent: 0 }, { xPercent: -50, duration: LOOP_SECONDS, ease: "none", repeat: -1 });
    },
    { scope: ref, dependencies: [reducedMotion, topics.length] },
  );

  return (
    <section aria-labelledby="topics-title" className="border-y border-rule">
      <h2 id="topics-title" className="sr-only">
        Topics
      </h2>
      <ul className="sr-only">
        {topics.map((topic) => (
          <li key={topic.slug}>{topic.label}</li>
        ))}
      </ul>
      <div ref={ref} aria-hidden className="overflow-x-clip py-6 md:py-8">
        <div
          data-row
          className={reducedMotion ? "flex flex-wrap px-6" : "flex w-max whitespace-nowrap will-change-transform"}
        >
          {(reducedMotion ? [topics] : [topics, topics]).map((copy, j) => (
            <span key={j} className="text-title font-medium text-ink-300">
              {copy.map((topic) => (
                <span key={topic.slug}>
                  {topic.label}
                  <span className="px-4 text-brand md:px-6">/</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
