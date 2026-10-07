import Image from "next/image";
import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";
import type { Image as ImageContent } from "@/content";

/**
 * The Flagship page's first screen: one photograph from a past edition, full
 * bleed, in black and white and dimmed, with the theme set large across its
 * lower edge. Where home opens on type and dots, this opens on the room.
 */
export function FlagshipHero({
  image,
  kicker,
  theme,
  statement,
  facts,
  action,
}: {
  image?: ImageContent;
  kicker: string;
  theme: string;
  statement?: string;
  facts: string;
  action?: { label: string; href: string };
}) {
  const focus = image?.focus ?? { x: 0.5, y: 0.5 };
  return (
    <section className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-background px-6 pt-32 pb-7">
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
          className="-z-10 object-cover brightness-75 contrast-110 grayscale"
        />
      )}
      {/* A flat wash, so the type reads anywhere on the photo. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink-950/45" />

      <p className="mb-4 text-heading font-medium text-ink-200">{kicker}</p>
      <SplitReveal as="h1" by="chars" onScroll={false} className="text-hero font-medium">
        {theme}
      </SplitReveal>
      {statement && (
        <SplitReveal as="p" delay={0.25} onScroll={false} className="mt-6 max-w-xl text-lead text-balance text-ink-100">
          {statement}
        </SplitReveal>
      )}
      <div className="mt-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mt-16">
        {action && <SquareLink href={action.href}>{action.label}</SquareLink>}
        <p className="text-small text-ink-200">{facts}</p>
      </div>
    </section>
  );
}
