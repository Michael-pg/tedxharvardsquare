"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Motto } from "@/components/home/motto";
import { SquareLink } from "@/components/ui/square-link";
import type { FlagshipPageCopy } from "@/content/types";
import { cn } from "@/lib/utils";

type Reason = FlagshipPageCopy["reasons"][number];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Where each tile sits on the 12-column grid from `md` up, seven bento rows
 * deep. Phones stack them in source order, photos and facts alternating.
 *
 *   statement ········· │ reason 1 (tall)
 *   statement ········· │ reason 1
 *   statement ········· │ reason 1
 *   reason 2 ···· │ when │ reason 1
 *   reason 2 ···· │ when │ who comes
 *   reason 3 ······ │ last time + ask
 *   reason 3 ······ │ last time + ask
 */
const AREA = {
  statement: "md:col-span-8 md:row-span-3",
  reason1: "md:col-span-4 md:col-start-9 md:row-span-4 md:row-start-1",
  reason2: "md:col-span-5 md:row-span-2 md:row-start-4",
  when: "md:col-span-3 md:col-start-6 md:row-span-2 md:row-start-4",
  who: "md:col-span-4 md:col-start-9 md:row-start-5",
  reason3: "md:col-span-7 md:row-span-2 md:row-start-6",
  proof: "md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-6",
};

/** A tile of type: no surface, just a hairline above it, so the grid stays open. */
const Facts = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div data-tile="type" className={cn("col-span-4 flex flex-col border-t border-rule pt-5", className)}>
    {children}
  </div>
);

/** A reason: its photograph, and beneath it the number and the reason in a line. */
function ReasonTile({ reason, number, className }: { reason: Reason; number: number; className: string }) {
  const focus = reason.image?.focus ?? { x: 0.5, y: 0.5 };
  return (
    <figure data-tile="photo" className={cn("col-span-4 flex flex-col", className)}>
      <div data-frame className="relative aspect-4/3 overflow-hidden bg-ink-900 md:aspect-auto md:min-h-0 md:flex-1">
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
      <figcaption data-caption className="flex gap-4 pt-4 text-heading font-medium">
        <span aria-hidden className="text-muted tabular-nums">
          {pad(number)}
        </span>
        <span className="text-balance">{reason.title}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The day, as one composed grid straight after the hero: the theme statement,
 * the three reasons to come as photographs, and the few facts a visitor is
 * looking for (when and where, who comes, how the last one went, and the way
 * in). Kept airy like the rest of the page: no tile surfaces, no type over
 * photos, a hairline above each fact, one short line per reason.
 *
 * It assembles as it scrolls in, the page's one set piece: each photo opens
 * from a thin slit while the image inside settles from a slight zoom, its line
 * following; type tiles rise after. Photos then drift a little inside their
 * frames as the page moves; the frames themselves never move or tilt. Under
 * reduced motion, or without JS, every tile is simply there.
 */
export function TheDay({
  statement,
  reasons,
  audience,
  when,
  where,
  proof,
  action,
}: {
  statement: string[];
  reasons: Reason[];
  /** Who comes, as one running line. */
  audience?: string;
  /** e.g. "February 20, 2027". */
  when?: string;
  /** e.g. ["Arrow Street Arts", "Cambridge, MA"]. */
  where: string[];
  /** How the last edition went, e.g. { headline: "Sold out", line: "Nearly 400 in the room…" }. */
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
    <div ref={ref} className="grid grid-cols-4 gap-x-4 gap-y-12 md:auto-rows-bento md:grid-cols-12 md:gap-x-6 md:gap-y-10">
      {statement.length > 0 && (
        <div className={cn("col-span-4 flex items-start pb-6 md:pb-0", AREA.statement)}>
          <Motto lines={statement} />
        </div>
      )}

      {first && <ReasonTile reason={first} number={1} className={AREA.reason1} />}

      {when && (
        <Facts className={cn("justify-between gap-6", AREA.when)}>
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

      {second && <ReasonTile reason={second} number={2} className={AREA.reason2} />}

      {audience && (
        <Facts className={AREA.who}>
          <p className="text-body text-ink-300">{audience}</p>
        </Facts>
      )}

      {third && <ReasonTile reason={third} number={3} className={AREA.reason3} />}

      {(proof || action) && (
        <Facts className={cn("justify-between gap-8", AREA.proof)}>
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
