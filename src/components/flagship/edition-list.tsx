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
  /** Its lineup on /speakers. */
  href: string;
  image?: ImageContent;
};

/**
 * Past Flagships as a short list, newest first, one compact row each between
 * hairlines: a small photo, the theme, one line of when, where and how it
 * went, and a way to the talks. Kept short so the archive can grow a row a
 * year without the section growing a screen.
 */
export function EditionList({ editions, watchLabel }: { editions: PastEditionRow[]; watchLabel: string }) {
  return (
    <Reveal as="ol" stagger className="border-t border-rule">
      {editions.map((edition) => {
        const focus = edition.image?.focus ?? { x: 0.5, y: 0.5 };
        const meta = [edition.when ?? String(edition.year), edition.where, ...edition.figures].filter(Boolean);
        return (
          <li
            key={edition.number}
            className="grid grid-cols-4 items-center gap-x-6 gap-y-4 border-b border-rule py-6 md:grid-cols-12"
          >
            <div className="relative col-span-2 aspect-3/2 overflow-hidden bg-ink-900 md:col-span-2">
              {edition.image && (
                <Image
                  src={edition.image.src}
                  alt={edition.image.alt}
                  fill
                  sizes="(min-width: 768px) 17vw, 50vw"
                  style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
                  className="object-cover"
                />
              )}
            </div>
            <div className="col-span-4 flex flex-col gap-2 md:col-span-7">
              <h3 className="text-title font-medium text-balance">{edition.title}</h3>
              <p className="text-body text-muted">{meta.join(" · ")}</p>
              {edition.recap && <p className="max-w-xl text-body text-ink-300">{edition.recap}</p>}
            </div>
            <div className="col-span-4 md:col-span-3 md:justify-self-end">
              <SquareLink href={edition.href} variant="secondary">
                {watchLabel}
              </SquareLink>
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}
