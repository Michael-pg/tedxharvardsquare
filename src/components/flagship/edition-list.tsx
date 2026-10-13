import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { SquareLink } from "@/components/ui/square-link";
import type { Image as ImageContent } from "@/content";

/** A past edition, with every line already written by the page. */
export type PastEditionRow = {
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

/**
 * Past Flagships as a short list, newest first, one row each between
 * hairlines: the number, a photo square to the grid, the theme with when and
 * where, and a way to the talks. Set like the rest of the page (straight
 * photos, numbered, type doing the work) and kept short, so the archive can
 * grow a row a year without the section growing a screen.
 */
export function EditionList({ editions }: { editions: PastEditionRow[] }) {
  return (
    <Reveal as="ol" stagger className="border-t border-rule">
      {editions.map((edition) => {
        const focus = edition.image?.focus ?? { x: 0.5, y: 0.5 };
        return (
          <li
            key={edition.number}
            className="grid grid-cols-4 items-start gap-x-6 gap-y-5 border-b border-rule py-8 md:grid-cols-12 md:py-10"
          >
            <p aria-hidden className="col-span-1 text-heading font-medium text-muted tabular-nums">
              {pad(edition.number)}
            </p>
            <div className="relative col-span-3 aspect-4/3 overflow-hidden bg-ink-900 md:col-span-3">
              {edition.image && (
                <Image
                  src={edition.image.src}
                  alt={edition.image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 75vw"
                  style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
                  className="object-cover"
                />
              )}
            </div>
            <div className="col-span-4 flex flex-col gap-3 md:col-span-5 md:col-start-6">
              <h3 className="text-title font-medium text-balance">{edition.title}</h3>
              <p className="text-body text-ink-200">
                {[edition.when ?? String(edition.year), edition.where].filter(Boolean).join(" · ")}
              </p>
              {edition.recap && <p className="max-w-xl text-body text-ink-300">{edition.recap}</p>}
              {(edition.speakers || edition.figures.length > 0) && (
                <p className="max-w-xl text-small text-muted">
                  {[edition.speakers, ...edition.figures].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="col-span-4 md:col-span-2 md:col-start-11 md:justify-self-end">
              <SquareLink href={edition.href} variant="secondary">
                Watch the talks
              </SquareLink>
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}
