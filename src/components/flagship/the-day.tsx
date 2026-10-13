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
 * Where each tile sits on the 12-column grid from `md` up, eight bento rows
 * deep. Phones stack them in source order, two kinds alternating.
 *
 *   statement ········· │ reason 1 (tall)
 *   statement ········· │ reason 1
 *   statement ········· │ reason 1
 *   reason 2 ···· │ when │ reason 1
 *   reason 2 ···· │ when │ who comes
 *   format ············ │ who comes
 *   reason 3 ······ │ last time + ask
 *   reason 3 ······ │ last time + ask
 */
const AREA = {
  statement: "md:col-span-8 md:row-span-3",
  reason1: "md:col-span-4 md:col-start-9 md:row-span-4 md:row-start-1",
  reason2: "md:col-span-5 md:row-span-2 md:row-start-4",
  when: "md:col-span-3 md:col-start-6 md:row-span-2 md:row-start-4",
  who: "md:col-span-4 md:col-start-9 md:row-span-2 md:row-start-5",
  format: "md:col-span-8 md:row-start-6",
  reason3: "md:col-span-7 md:row-span-2 md:row-start-7",
  proof: "md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-7",
};

/** A tile of type on a raised surface. */
const Plate = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div data-tile="type" className={cn("col-span-4 flex flex-col bg-ink-900 p-6 md:p-8", className)}>
    {children}
  </div>
);

/** A reason: its photograph to the tile's edges, the line set over its foot. */
function ReasonTile({ reason, number, className }: { reason: Reason; number: number; className: string }) {
  const focus = reason.image?.focus ?? { x: 0.5, y: 0.5 };
  return (
    <figure
      data-tile="photo"
      className={cn("relative col-span-4 flex flex-col overflow-hidden bg-ink-900 md:block", className)}
    >
      {/* On phones the photo sits above its line; from md up it fills the
          tile and the line is set over its foot. */}
      <div className="relative aspect-4/3 overflow-hidden md:absolute md:inset-0 md:aspect-auto">
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
        <div aria-hidden className="absolute inset-0 hidden bg-linear-to-t from-ink-950/90 via-ink-950/30 to-transparent md:block" />
      </div>
      <figcaption data-caption className="flex gap-4 p-6 md:absolute md:inset-x-0 md:bottom-0 md:p-8">
        <span aria-hidden className="text-heading font-medium text-ink-300 tabular-nums">
          {pad(number)}
        </span>
        <span className="flex flex-col gap-2">
          <span className="text-heading font-medium text-balance">{reason.title}</span>
          {reason.body && <span className="max-w-md text-body text-ink-200">{reason.body}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The day, as one composed grid straight after the hero: the theme statement,
 * the three reasons to come as photographs, and the facts a visitor is
 * looking for (when and where, the format, who comes, how the last one went,
 * and the way in), each a tile of its own size. It replaces the stack of
 * statement, collage and "Why come" sections with one screen and a half.
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
  format,
  audience,
  when,
  where,
  proof,
  action,
}: {
  statement: string[];
  reasons: Reason[];
  /** e.g. "Talks, Discovery Sessions and conversations, all in one day." */
  format?: string;
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

      gsap.set(photos, { clipPath: "inset(48% 0% 48% 0%)" });
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
              gsap.to(tile, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: timing.ease.expo, delay });
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
    <div ref={ref} className="grid grid-cols-4 gap-4 md:auto-rows-bento md:grid-cols-12 md:gap-6">
      {statement.length > 0 && (
        <div className={cn("col-span-4 flex items-start pb-6 md:pb-0", AREA.statement)}>
          <Motto lines={statement} />
        </div>
      )}

      {first && <ReasonTile reason={first} number={1} className={AREA.reason1} />}

      {when && (
        <Plate className={cn("justify-between gap-10", AREA.when)}>
          <p className="text-title font-medium text-balance">{when}</p>
          {where.length > 0 && (
            <p className="flex flex-col text-body text-ink-300">
              {where.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          )}
        </Plate>
      )}

      {second && <ReasonTile reason={second} number={2} className={AREA.reason2} />}

      {audience && (
        <Plate className={cn("justify-end", AREA.who)}>
          <p className="text-heading font-medium text-balance">{audience}</p>
        </Plate>
      )}

      {format && (
        <div data-tile="type" className={cn("col-span-4 flex items-center py-6 md:py-0", AREA.format)}>
          <p className="max-w-4xl text-title font-medium text-balance text-ink-300">{format}</p>
        </div>
      )}

      {third && <ReasonTile reason={third} number={3} className={AREA.reason3} />}

      {(proof || action) && (
        <Plate className={cn("justify-between gap-10", AREA.proof)}>
          {proof && (
            <div className="flex flex-col gap-3">
              <p className="text-display font-medium">{proof.headline}</p>
              {proof.line && <p className="max-w-sm text-lead text-ink-300">{proof.line}</p>}
            </div>
          )}
          {action && (
            <div>
              <SquareLink href={action.href}>{action.label}</SquareLink>
            </div>
          )}
        </Plate>
      )}
    </div>
  );
}
