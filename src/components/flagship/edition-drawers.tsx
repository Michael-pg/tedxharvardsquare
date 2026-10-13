"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { HalftonePhoto } from "@/components/home/halftone-photo";
import { SquareLink } from "@/components/ui/square-link";
import type { Image as ImageContent } from "@/content/types";

/** A past edition, with every line already written by the page. */
export type DrawerEdition = {
  number: number;
  year: number;
  /** The theme, or "Edition N" when it has none on record. */
  title: string;
  /** The date, when it is more than the year. */
  when?: string;
  where?: string;
  recap?: string;
  /** e.g. "12 talks", "373 attended". */
  figures: string[];
  /** e.g. "Jeff Harmon, Shawna Young, Andrea Choe and 9 others". */
  speakers?: string;
  /** Its lineup on /speakers. */
  href: string;
  image?: ImageContent;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** How long the pointer rests on a drawer before it pulls open. */
const HOVER_INTENT_MS = 140;

/**
 * Past Flagships as a row of drawers. One is pulled most of the way open:
 * its photograph in colour, its theme, who spoke, a way to the talks. The
 * rest are shut to a narrow strip showing their number and a slice of the
 * photo printed in red halftone, as if it is still developing. Resting the
 * pointer on one, or clicking it, pulls it open as the open one slides shut.
 * On phones the drawers stack and open downward.
 *
 * Each drawer's contents sit on a plate sized to the open drawer, so nothing
 * reflows while a drawer moves: it only uncovers more of the plate. The open
 * drawer always stays open (an accordion that can't collapse), so its button
 * is marked disabled. Under reduced motion the drawers switch instantly.
 */
export function EditionDrawers({ editions }: { editions: DrawerEdition[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(0);
  const [plate, setPlate] = useState<{ width: number; height: number }>();
  const reducedMotion = useReducedMotion();
  const settled = useRef(false);
  const hover = useRef<number | undefined>(undefined);

  // The plate is the open drawer's size: the list, less the closed strips.
  useEffect(() => {
    const el = list.current;
    const first = el?.firstElementChild;
    if (!el || !first) return;
    const measure = () => {
      const strip = parseFloat(getComputedStyle(first).flexBasis) || 0;
      const closed = (editions.length - 1) * strip;
      const row = getComputedStyle(el).flexDirection === "row";
      setPlate(
        row
          ? { width: el.clientWidth - closed, height: el.clientHeight }
          : { width: el.clientWidth, height: el.clientHeight - closed },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [editions.length]);

  useEffect(() => () => window.clearTimeout(hover.current), []);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-drawer]");
      // The first run only puts the drawers where the markup already has them.
      const instant = reducedMotion || !settled.current;
      settled.current = true;
      items.forEach((item, i) => {
        const isOpen = i === open;
        const q = gsap.utils.selector(item);
        if (instant) {
          gsap.set(item, { flexGrow: isOpen ? 1 : 0 });
          gsap.set(q("[data-colour], [data-content]"), { autoAlpha: isOpen ? 1 : 0, y: 0 });
          gsap.set(q("[data-label]"), { autoAlpha: isOpen ? 0 : 1 });
          return;
        }
        // Grows run on the same ease and length, so the open and closing
        // drawers always add up to the full row.
        gsap.to(item, { flexGrow: isOpen ? 1 : 0, duration: 0.9, ease: "power3.inOut", overwrite: "auto" });
        if (isOpen) {
          gsap.to(q("[data-label]"), { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
          gsap.to(q("[data-colour]"), { autoAlpha: 1, duration: 0.7, delay: 0.3, ease: "power2.out", overwrite: "auto" });
          gsap.fromTo(
            q("[data-content]"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.5, overwrite: "auto" },
          );
        } else {
          gsap.to(q("[data-content]"), { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
          gsap.to(q("[data-colour]"), { autoAlpha: 0, duration: 0.5, delay: 0.1, overwrite: "auto" });
          gsap.to(q("[data-label]"), { autoAlpha: 1, duration: 0.4, delay: 0.6, overwrite: "auto" });
        }
      });
    },
    { scope: list, dependencies: [open, reducedMotion] },
  );

  const rest = (i: number) => {
    window.clearTimeout(hover.current);
    hover.current = window.setTimeout(() => setOpen(i), HOVER_INTENT_MS);
  };

  // Arrow keys move between the drawers' buttons, as in any accordion.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = editions.length - 1;
    const target = {
      ArrowRight: i === last ? 0 : i + 1,
      ArrowDown: i === last ? 0 : i + 1,
      ArrowLeft: i === 0 ? last : i - 1,
      ArrowUp: i === 0 ? last : i - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    list.current?.querySelectorAll<HTMLButtonElement>("[data-drawer-button]")[target]?.focus();
  };

  return (
    <ul ref={list} className="flex h-svh flex-col border-y border-rule md:h-drawer md:flex-row">
      {editions.map((edition, i) => {
        const isOpen = i === open;
        const id = `edition-drawer-${edition.number}`;
        const focus = edition.image?.focus ?? { x: 0.5, y: 0.5 };
        return (
          <li
            key={edition.number}
            data-drawer
            onPointerEnter={(event) => event.pointerType === "mouse" && rest(i)}
            onPointerLeave={() => window.clearTimeout(hover.current)}
            // The whole strip is the target for a pointer; the button is the
            // way in for the keyboard and screen readers.
            onClick={() => setOpen(i)}
            className={cn(
              !isOpen && "cursor-pointer",
              "relative basis-16 overflow-hidden border-t border-rule first:border-t-0 md:basis-20 md:border-t-0 md:border-l md:first:border-l-0",
              i === 0 ? "grow" : "grow-0",
            )}
          >
            <div
              className="absolute top-0 left-0 flex size-full flex-col"
              style={plate ? { width: plate.width, height: plate.height } : undefined}
            >
              <div className="h-16 shrink-0" />

              <div className="relative h-2/5 shrink-0 overflow-hidden bg-ink-900 md:h-1/2">
                {edition.image ? (
                  <>
                    <HalftonePhoto
                      image={{ ...edition.image, alt: "" }}
                      focus={focus}
                      cell={7}
                      pointer={false}
                      className="size-full"
                    />
                    <div data-colour className={cn("absolute inset-0", i !== 0 && "opacity-0")}>
                      <Image
                        src={edition.image.src}
                        alt={edition.image.alt}
                        fill
                        sizes="(min-width: 768px) 80vw, 100vw"
                        style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
                        className="object-cover"
                      />
                    </div>
                  </>
                ) : (
                  <p aria-hidden className="absolute bottom-4 left-5 text-mega font-medium text-ink-700 tabular-nums">
                    {pad(edition.number)}
                  </p>
                )}
              </div>

              <div
                id={id}
                data-content
                inert={!isOpen}
                className={cn(
                  "grid min-h-0 flex-1 content-start gap-x-6 gap-y-5 overflow-hidden p-5 md:grid-cols-12 md:p-8",
                  i !== 0 && "opacity-0",
                )}
              >
                <div className="flex flex-col gap-3 md:col-span-7">
                  <p className="text-title font-medium text-balance">{edition.title}</p>
                  {(edition.when || edition.where) && (
                    <p className="text-body text-ink-200">{[edition.when, edition.where].filter(Boolean).join(" · ")}</p>
                  )}
                  {edition.recap && <p className="max-w-xl text-lead text-ink-300">{edition.recap}</p>}
                </div>
                <div className="flex flex-col items-start gap-4 md:col-span-5">
                  {edition.figures.length > 0 && (
                    <p className="text-small text-muted">{edition.figures.join(" · ")}</p>
                  )}
                  {edition.speakers && <p className="text-body text-ink-300 max-md:hidden">{edition.speakers}</p>}
                  <SquareLink href={edition.href} variant="secondary">
                    Watch the talks
                  </SquareLink>
                </div>
              </div>
            </div>

            {/* The strip's own label: the theme up the side, or along it on phones. */}
            <p
              data-label
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-0 right-5 flex h-16 max-w-1/2 items-center truncate text-body text-ink-300",
                "md:top-auto md:right-auto md:bottom-8 md:left-0 md:h-auto md:max-h-3/5 md:w-20 md:max-w-none md:justify-center md:text-vertical",
                i === 0 && "opacity-0",
              )}
            >
              {edition.title}
            </p>

            <h3 className="absolute top-0 left-0 max-w-full">
              <button
                type="button"
                data-drawer-button
                aria-expanded={isOpen}
                aria-controls={id}
                aria-disabled={isOpen || undefined}
                onClick={() => setOpen(i)}
                onKeyDown={(event) => onKeyDown(event, i)}
                className={cn(!isOpen && "cursor-pointer", "flex h-16 items-center gap-4 px-5 text-heading font-medium whitespace-nowrap tabular-nums focus-visible:-outline-offset-4")}
              >
                <span>{pad(edition.number)}</span>
                <span className="text-muted">{edition.year}</span>
                <span className="sr-only">{`, ${edition.title}`}</span>
              </button>
            </h3>
          </li>
        );
      })}
    </ul>
  );
}
