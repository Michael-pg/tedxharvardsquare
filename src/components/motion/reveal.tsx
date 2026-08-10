"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { PolymorphicTag } from "./polymorphic";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Distance travelled, in px. Keep it small — motion should suggest, not shove. */
  y?: number;
  /**
   * Stagger direct children instead of animating the container as one unit.
   * Use for lists; the container itself stays put.
   */
  stagger?: boolean;
};

/**
 * The default scroll reveal. Reach for this before writing a bespoke tween —
 * consistent entrance motion is most of what makes a site feel considered.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 24,
  stagger = false,
}: RevealProps) {
  const container = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = container.current;
      if (!element) return;

      // Clear the `data-animate` hide before tweening. `autoAlpha` from-tweens
      // read the *current* computed value as their end state, so without this
      // the element would animate to `visibility: hidden` and stay invisible.
      gsap.set(element, { autoAlpha: 1 });
      if (reducedMotion) return;

      const targets = stagger ? Array.from(element.children) : element;

      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: timing.duration.base,
        ease: timing.ease.out,
        delay,
        stagger: stagger ? timing.stagger.base : 0,
        scrollTrigger: { trigger: element, start: "top 85%", once: true },
      });
    },
    { scope: container, dependencies: [reducedMotion, delay, y, stagger] },
  );

  // TypeScript collapses props to `never` when a polymorphic `as` is combined
  // with a ref, because it cannot resolve the ref type across the element
  // union. The cast is the standard escape hatch; runtime JSX handles both
  // intrinsic tags and components here.
  const Component = Tag as PolymorphicTag;

  return (
    <Component ref={container} className={className} data-animate>
      {children}
    </Component>
  );
}
