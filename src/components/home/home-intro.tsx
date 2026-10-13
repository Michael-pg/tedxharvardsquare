"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, SplitText, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { INTRO, introPending } from "@/lib/intro";

/**
 * The home hero, and the loader that opens it. When someone arrives after
 * time away (see `INTRO`), the page starts on black: a hairline fills along the bottom toward a
 * counter running to 100, while the dot field gathers into order behind it (the
 * field times itself from `INTRO`). Then the line fades, the headline arrives
 * word by word, and the rest of the hero follows.
 *
 * Children opt in with `data-intro` (and `data-animate`, so they start
 * hidden): `data-intro="headline"` wraps the `h1`, which is split into words;
 * everything else arrives in document order. A reload, a return while
 * browsing, reduced motion and no JS all show the hero as it is.
 */
export function HomeIntro({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLElement>(null);
  const loader = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const parts = gsap.utils.toArray<HTMLElement>("[data-intro]");
      gsap.set(parts, { autoAlpha: 1 });
      if (reducedMotion || !introPending()) return;

      const headline = root.current?.querySelector<HTMLElement>("[data-intro='headline'] h1");
      const rest = parts.filter((part) => part.dataset.intro !== "headline");
      const count = { value: 0 };
      const timeline = gsap.timeline();

      timeline
        .set(loader.current, { autoAlpha: 1 }, 0)
        .fromTo(fill.current, { scaleX: 0 }, { scaleX: 1, duration: INTRO.count, ease: timing.ease.inOut }, 0)
        .to(
          count,
          {
            value: 100,
            duration: INTRO.count,
            ease: timing.ease.inOut,
            onUpdate: () => {
              if (counter.current) counter.current.textContent = String(Math.round(count.value)).padStart(3, "0");
            },
          },
          0,
        )
        .to(loader.current, { autoAlpha: 0, duration: timing.duration.base, ease: timing.ease.inOut }, INTRO.count + 0.1);

      if (headline) {
        // Words, not chars: chars lose their kerning, and the headline is
        // sized to the pixel to fill the width.
        const split = SplitText.create(headline, { type: "words", aria: "none" });
        timeline.from(
          split.words,
          {
            yPercent: 30,
            autoAlpha: 0,
            duration: timing.duration.slow,
            ease: timing.ease.expo,
            stagger: 0.12,
            onComplete: () => split.revert(),
          },
          INTRO.reveal,
        );
      }
      timeline.from(
        rest,
        { y: 16, autoAlpha: 0, duration: timing.duration.slow, ease: timing.ease.expo, stagger: 0.12 },
        INTRO.reveal + 0.35,
      );
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section ref={root} className={`relative ${className ?? ""}`}>
      {children}
      <div
        ref={loader}
        aria-hidden="true"
        style={{ visibility: "hidden" }}
        className="pointer-events-none absolute inset-x-6 bottom-7 flex items-center gap-4"
      >
        <span className="relative h-px flex-1 bg-rule">
          <span ref={fill} className="absolute inset-0 origin-left bg-foreground" />
        </span>
        <span ref={counter} className="text-small text-muted tabular-nums">
          000
        </span>
      </div>
    </section>
  );
}
