"use client";

import Image from "next/image";
import { Fragment, useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { SquareLink } from "@/components/ui/square-link";
import { TextDots } from "@/components/flagship/text-dots";
import type { FlagshipPageCopy } from "@/content/types";
import { cn } from "@/lib/utils";

type Reason = FlagshipPageCopy["reasons"][number];

/**
 * From `md` up each reason is one row of the 12-column grid: the photo takes
 * seven columns, one is left empty, and the text takes the last four. Rows
 * alternate which side the photo is on, and the text is centred against the
 * photo so the pair reads as one unit with equal space above and below.
 * Phones stack photo, then text.
 */
const ROW = [
  { photo: "md:col-start-1", text: "md:col-start-9", side: "right" as const },
  { photo: "md:col-start-6", text: "md:col-start-1", side: "left" as const },
  { photo: "md:col-start-1", text: "md:col-start-9", side: "right" as const },
];

/** A reason's photograph, on its own: the title is set with the text. */
function ReasonPhoto({ reason, className }: { reason: Reason; className: string }) {
  const focus = reason.image?.focus ?? { x: 0.5, y: 0.5 };
  return (
    <figure data-tile="photo" className={cn("col-span-4 md:col-span-7 md:row-start-1", className)}>
      <div data-frame className="relative aspect-3/2 overflow-hidden bg-ink-900">
        {reason.image && (
          <div data-drift className="absolute inset-0">
            <Image
              data-photo
              src={reason.image.src}
              alt={reason.image.alt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </figure>
  );
}

/**
 * A reason's words: its title and, where there is one, its body, then the
 * fact that goes with it on a hairline. A faint patch of dots sits behind and
 * beside the type.
 */
function ReasonText({
  reason,
  row,
  salt,
  children,
}: {
  reason: Reason;
  row: (typeof ROW)[number];
  salt: number;
  children?: ReactNode;
}) {
  return (
    <div data-tile="type" className={cn("relative col-span-4 md:col-span-4 md:row-start-1", row.text)}>
      <TextDots side={row.side} anchorY={salt % 2 ? 0.25 : 0.7} salt={salt} />
      <div data-dot-clear className="relative flex flex-col gap-5">
        <h3 className="text-title font-medium text-balance">{reason.title}</h3>
        {reason.body && <p className="max-w-md text-lead text-ink-300">{reason.body}</p>}
        {children && <div className="mt-3 flex flex-col gap-6 border-t border-rule pt-5">{children}</div>}
      </div>
    </div>
  );
}

/**
 * The day, after the theme statement: the three reasons to come as
 * photographs, each with its title and words and one of the facts a visitor is looking for set
 * opposite it (when and where, who comes, how the last one went and the way
 * in). Airy like the rest of the page: open space between the rows, no tile
 * surfaces, no type over photos, a hairline above each fact.
 *
 * It assembles as it scrolls in, the page's one set piece: each photo opens
 * from a thin slit while the image inside settles from a slight zoom; the text
 * beside it rises after. Photos then drift a little inside their
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
      photos.forEach((tile) => gsap.set(tile.querySelectorAll("[data-photo]"), { scale: 1.18 }));

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

  // One fact per reason, in order. With fewer than three reasons the facts
  // left over join the last one, so the date and the ticket ask never drop out.
  const facts: ReactNode[] = [
    when && (
      <>
        <p className="text-heading font-medium text-balance">{when}</p>
        {where.length > 0 && (
          <p className="-mt-4 flex flex-col text-body text-muted">
            {where.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        )}
      </>
    ),
    audience && <p className="text-body text-ink-200">{audience}</p>,
    (proof || action) && (
      <>
        {proof && (
          <div className="flex flex-col gap-2">
            <p className="text-title font-medium">{proof.headline}</p>
            {proof.line && <p className="max-w-sm text-body text-muted">{proof.line}</p>}
          </div>
        )}
        {action && (
          <div>
            <SquareLink href={action.href}>{action.label}</SquareLink>
          </div>
        )}
      </>
    ),
  ];
  const shown = [first, second, third].filter((reason): reason is Reason => Boolean(reason));

  return (
    <div ref={ref} className="flex flex-col gap-y-20 overflow-x-clip md:gap-y-32">
      {shown.map((reason, i) => {
        const own = (i === shown.length - 1 ? facts.slice(i) : [facts[i]]).filter(Boolean);
        return (
          <div key={i} className="grid grid-cols-4 items-center gap-x-6 gap-y-8 md:grid-cols-12">
            <ReasonPhoto reason={reason} className={ROW[i].photo} />
            <ReasonText reason={reason} row={ROW[i]} salt={i + 1}>
              {own.length > 0 && own.map((fact, f) => <Fragment key={f}>{fact}</Fragment>)}
            </ReasonText>
          </div>
        );
      })}
    </div>
  );
}
