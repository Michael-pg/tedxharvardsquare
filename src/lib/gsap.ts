"use client";

/**
 * Single registration point for GSAP and its plugins.
 *
 * Every client component that animates should import `gsap` / `useGSAP` from
 * here rather than from the packages directly — that guarantees plugins are
 * registered exactly once, before any tween is created.
 *
 * All GSAP plugins are free as of the Webflow acquisition, so anything in
 * `gsap/*` is fair game. Add new plugins to the import + register call below.
 */

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Observer);

/**
 * Project-wide motion defaults. Durations and eases live here so timing stays
 * systematic instead of being re-invented per component.
 */
export const timing = {
  ease: {
    out: "power3.out",
    inOut: "power2.inOut",
    expo: "expo.out",
  },
  duration: {
    fast: 0.3,
    base: 0.6,
    slow: 1.2,
  },
  stagger: {
    tight: 0.04,
    base: 0.08,
  },
} as const;

gsap.defaults({ ease: timing.ease.out, duration: timing.duration.base });

/**
 * Development-only escape hatch. Animation bugs are hard to inspect from a
 * console without a handle on the library — this makes `gsap.globalTimeline`,
 * `ScrollTrigger.getAll()`, and friends reachable while debugging. Stripped
 * from production builds.
 */
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  Object.assign(window, { gsap, ScrollTrigger });
}

export { gsap, useGSAP, ScrollTrigger, SplitText, Observer };
