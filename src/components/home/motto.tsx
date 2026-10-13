"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Inline-block so each word can move; the spaces stay outside the boxes, or
// they would collapse.
const Words = ({ text }: { text: string }) =>
  text.split(" ").map((word, j) => (
    <Fragment key={j}>
      {j > 0 && " "}
      <span data-word className="inline-block">
        {word}
      </span>
    </Fragment>
  ));

/**
 * The motto as one statement, with its answer set clearly smaller beneath it.
 * As it scrolls into view the words come out of focus one after another —
 * blurred, faint and a few pixels low, easing into place — and the answer
 * follows once the statement has landed. It plays once, on its own clock, so
 * the ease stays smooth whatever the scroll speed.
 *
 * Without JS, or under reduced motion, every word is simply there.
 */
export function Motto({ lines, coda }: { lines: string[]; coda?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || reducedMotion) return;
      const from = { autoAlpha: 0, filter: "blur(14px)", y: 16 };
      const to = { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power2.out" };
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: element, start: "top 75%", once: true },
      });
      timeline.fromTo(element.querySelectorAll("[data-statement] [data-word]"), from, { ...to, stagger: 0.06 });
      const codaWords = element.querySelectorAll("[data-coda] [data-word]");
      if (codaWords.length) timeline.fromTo(codaWords, from, { ...to, stagger: 0.03 }, "-=0.9");
      // Leave no filter behind once the words are sharp.
      timeline.set(element.querySelectorAll("[data-word]"), { clearProps: "filter" });
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <div ref={ref}>
      <p data-dot-clear data-statement className="text-statement font-medium">
        {lines.map((line, i) => (
          <span key={i} className="block">
            <Words text={line} />
          </span>
        ))}
      </p>
      {coda && (
        <p data-dot-clear data-coda className="mt-10 max-w-3xl text-title font-medium text-balance text-ink-300 md:mt-16">
          <Words text={coda} />
        </p>
      )}
    </div>
  );
}
