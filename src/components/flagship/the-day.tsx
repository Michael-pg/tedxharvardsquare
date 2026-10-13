"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { SquareLink } from "@/components/ui/square-link";
import type { FlagshipPageCopy } from "@/content/types";
import { cn } from "@/lib/utils";

type Reason = FlagshipPageCopy["reasons"][number];

/**
 * From `md` up the reasons zigzag down the page, each photo with one fact
 * opposite it across open space: when and where, who comes, then how the last
 * one went and the way in. Phones stack them in source order.
 */
const ROW = [
  { photo: "md:col-span-6", facts: "md:col-span-4 md:col-start-9" },
  { photo: "md:col-span-6 md:col-start-7 md:row-start-2", facts: "md:col-span-4 md:col-start-1 md:row-start-2" },
  { photo: "md:col-span-7", facts: "md:col-span-4 md:col-start-9" },
];

/** A fact: no surface, a hairline above it, settled to the foot of its row. */
const Facts = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div data-tile="type" data-dot-clear className={cn("col-span-4 flex flex-col self-end border-t border-rule pt-5", className)}>
    {children}
  </div>
);

/** A reason: its photograph, and its title beneath. */
function ReasonTile({ reason, className }: { reason: Reason; className: string }) {
  const focus = reason.image?.focus ?? { x: 0.5, y: 0.5 };
  return (
    <figure data-tile="photo" className={cn("col-span-4 flex flex-col", className)}>
      <div data-frame className="relative aspect-3/2 overflow-hidden bg-ink-900">
        {reason.image && (
          <div data-drift className="absolute inset-0">
            <Image
              data-photo
              src={reason.image.src}
              alt={reason.image.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
              className="object-cover"
            />
          </div>
        )}
      </div>
      <figcaption data-caption data-dot-clear className="pt-4 text-heading font-medium text-balance">
        {reason.title}
      </figcaption>
    </figure>
  );
}

/**
 * The day, after the theme statement: the three reasons to come as
 * photographs, each with one of the facts a visitor is looking for set
 * opposite it (when and where, who comes, how the last one went and the way
 * in). Airy like the rest of the page: open space between the rows, no tile
 * surfaces, no type over photos, a hairline above each fact.
 *
 * It assembles as it scrolls in, the page's one set piece: each photo opens
 * from a thin slit while the image inside settles from a slight zoom, its line
 * following; type tiles rise after. Photos then drift a little inside their
 * frames as the page moves; the frames themselves never move or tilt. Under
 * reduced motion, or without JS, every tile is simply there.
 */
export function TheDay({
  reasons,
  audience,
  when,
  where,
  proof,
  action,
}: {
  reasons: Reason[];
  /** Who comes, as one running line. */
  audience?: string;
  /** e.g. "February 20, 2027". */
  when?: string;
  /** e.g. ["Arrow Street Arts", "Cambridge, MA"]. */
  where: string[];
  /** How the last edition went, e.g. { headline: "Nearly 400", line: "in the room at … It sold out." }. */
  proof?: { headline: string; line?: string };
  action?: { label: string; href: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [first, second, third] = reasons;

  useGSAP(
    () => {
      if (reducedMotion) return;
      const photos = gsap.utils.toArray<HTMLElement>('[data-tile="photo"]');
      const types = gsap.utils.toArray<HTMLElement>('[data-tile="type"]');

      gsap.set(photos.map((tile) => tile.querySelector("[data-frame]")), { clipPath: "inset(48% 0% 48% 0%)" });
      gsap.set(types, { autoAlpha: 0, y: 24 });
      photos.forEach((tile) => {
        gsap.set(tile.querySelectorAll("[data-photo]"), { scale: 1.18 });
        gsap.set(tile.querySelectorAll("[data-caption]"), { autoAlpha: 0, y: 16 });
      });

      // Tiles entering together open in a ripple rather than all at once.
      ScrollTrigger.batch([...photos, ...types], {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((tile, i) => {
            const delay = i * 0.12;
            if ((tile as HTMLElement).dataset.tile === "photo") {
              gsap.to(tile.querySelector("[data-frame]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: timing.ease.expo, delay });
              gsap.to(tile.querySelectorAll("[data-photo]"), { scale: 1, duration: 1.6, ease: timing.ease.expo, delay });
              gsap.to(tile.querySelectorAll("[data-caption]"), {
                autoAlpha: 1,
                y: 0,
                duration: timing.duration.base,
                ease: timing.ease.out,
                delay: delay + 0.5,
              });
            } else {
              gsap.to(tile, { autoAlpha: 1, y: 0, duration: timing.duration.base, ease: timing.ease.out, delay: delay + 0.2 });
            }
          });
        },
      });

      // The drift: inside the frame only, so the grid itself stays still.
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((drift) => {
        gsap.fromTo(
          drift,
          { yPercent: -4, scale: 1.1 },
          {
            yPercent: 4,
            scale: 1.1,
            ease: "none",
            scrollTrigger: { trigger: drift.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <div ref={ref} className="grid grid-cols-4 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-y-28">
      {first && <ReasonTile reason={first} className={ROW[0].photo} />}
      {when && (
        <Facts className={cn("gap-6", ROW[0].facts)}>
          <p className="text-title font-medium text-balance">{when}</p>
          {where.length > 0 && (
            <p className="flex flex-col text-body text-muted">
              {where.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          )}
        </Facts>
      )}

      {second && <ReasonTile reason={second} className={ROW[1].photo} />}
      {audience && (
        <Facts className={ROW[1].facts}>
          <p className="text-lead text-ink-300">{audience}</p>
        </Facts>
      )}

      {third && <ReasonTile reason={third} className={ROW[2].photo} />}
      {(proof || action) && (
        <Facts className={cn("gap-8", ROW[2].facts)}>
          {proof && (
            <div className="flex flex-col gap-3">
              <p className="text-display font-medium">{proof.headline}</p>
              {proof.line && <p className="max-w-sm text-body text-muted">{proof.line}</p>}
            </div>
          )}
          {action && (
            <div>
              <SquareLink href={action.href}>{action.label}</SquareLink>
            </div>
          )}
        </Facts>
      )}
    </div>
  );
}
