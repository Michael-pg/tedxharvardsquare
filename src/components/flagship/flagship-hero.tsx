import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";

/**
 * The Flagship page's first screen, set as a poster: the date and venue,
 * quiet, in the top corner from the first frame; "Flagship" huge along the
 * bottom with the theme beneath it; then the way in and, opposite, the line
 * that explains the theme. The home page leads with the theme, so here the
 * page's name leads instead. No photograph; the dot field behind is the
 * backdrop.
 */
export function FlagshipHero({
  title,
  theme,
  pitch,
  when,
  venue,
  city,
  action,
}: {
  /** The large word along the bottom, "Flagship" unless changed in Studio. */
  title: string;
  theme: string;
  pitch?: string;
  /** The date as it should read, e.g. "February 20, 2027". */
  when?: string;
  venue?: string;
  city?: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="flex min-h-svh flex-col px-6 pt-24 pb-7 md:pt-28">
      {(when || venue || city) && (
        <p data-dot-clear className="flex w-fit flex-col text-lead font-medium">
          {when && <span>{when}</span>}
          {(venue || city) && (
            // Each part keeps to one line; a narrow screen breaks between them.
            <span className="flex flex-wrap gap-x-2 text-ink-300">
              {venue && <span className="whitespace-nowrap">{city ? `${venue},` : venue}</span>}
              {city && <span className="whitespace-nowrap">{city}</span>}
            </span>
          )}
        </p>
      )}

      {/* Lines, not chars: split chars lose their kerning and shift when the
          split is undone. */}
      <h1 className="mt-auto pt-16 font-medium">
        <SplitReveal as="span" by="lines" onScroll={false} className="block text-mega">
          {title}
        </SplitReveal>
        <span className="sr-only">{": "}</span>
        <SplitReveal as="span" by="lines" delay={0.15} onScroll={false} className="mt-3 block text-statement text-balance md:mt-4">
          {theme}
        </SplitReveal>
      </h1>

      {(action || pitch) && (
        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-6 md:mt-12">
          {action && <SquareLink href={action.href}>{action.label}</SquareLink>}
          {/* On a phone the explanation reads before the button. */}
          {pitch && (
            <p data-dot-clear className="-order-1 max-w-xs text-lead text-balance text-ink-300 md:order-none md:ml-auto">
              {pitch}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
