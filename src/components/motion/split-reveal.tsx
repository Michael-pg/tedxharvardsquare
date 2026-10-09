"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { PolymorphicTag } from "./polymorphic";

type SplitRevealProps = {
  children: ReactNode;
  /** Element to render. Choose for semantics; this component has no opinion. */
  as?: ElementType;
  className?: string;
  /** Unit to stagger. Lines read best for prose, chars for short display type. */
  by?: "lines" | "words" | "chars";
  delay?: number;
  /** Wait until the element scrolls into view. Off for above-the-fold copy. */
  onScroll?: boolean;
};

/**
 * Reveal of split text: each piece fades up a short way, in the open. No
 * mask: sliding up through one cut off ascenders and descenders on tightly
 * set display type until the text landed.
 *
 * The element carries `data-animate`, which `globals.css` hides until GSAP
 * takes over — that prevents a flash of unsplit text while fonts load. Under
 * `prefers-reduced-motion` the CSS force-reveals it and no tween is created.
 */
export function SplitReveal({
  children,
  as: Tag = "p",
  className,
  by = "lines",
  delay = 0,
  onScroll = true,
}: SplitRevealProps) {
  const container = useRef<HTMLElement>(null);
  const pristineMarkup = useRef<string | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = container.current;
      if (!element) return;

      // SplitText rewrites this element's DOM out from under React. If a stale
      // split is still in place when we split again — React StrictMode's double
      // effect, a hot reload, or `autoSplit` firing on resize — the new split
      // nests inside the old one and every glyph is duplicated. Restoring the
      // pristine markup first makes splitting idempotent.
      if (pristineMarkup.current === null) {
        pristineMarkup.current = element.innerHTML;
      } else {
        element.innerHTML = pristineMarkup.current;
      }

      gsap.set(element, { autoAlpha: 1 });
      if (reducedMotion) return;

      const split = SplitText.create(element, {
        type: by,
        autoSplit: true,
        aria: "auto",
        // Splitting to chars turns every glyph into its own box, so the browser
        // will happily break "Meet" across two lines. `smartWrap` keeps words
        // intact by wrapping them in nowrap spans. Only meaningful for chars.
        smartWrap: by === "chars",
        onSplit(self) {
          return gsap.from(self[by], {
            yPercent: 25,
            autoAlpha: 0,
            duration: timing.duration.slow,
            ease: timing.ease.expo,
            stagger: by === "chars" ? timing.stagger.tight : timing.stagger.base,
            delay,
            scrollTrigger: onScroll
              ? { trigger: element, start: "top 85%", once: true }
              : undefined,
          });
        },
      });

      return () => {
        split.revert();
        if (pristineMarkup.current !== null) {
          element.innerHTML = pristineMarkup.current;
        }
      };
    },
    { scope: container, dependencies: [reducedMotion, by, onScroll, delay] },
  );

  // See the note on the same cast in `reveal.tsx`.
  const Component = Tag as PolymorphicTag;

  return (
    <Component ref={container} className={className} data-animate>
      {children}
    </Component>
  );
}
