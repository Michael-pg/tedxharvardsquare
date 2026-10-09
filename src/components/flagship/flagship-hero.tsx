import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";

/**
 * The Flagship page's first screen, set as a poster: the date and venue in
 * the top corner from the first frame, a short pitch opposite, and
 * "Flagship" over the theme, huge, along the bottom. No photograph;
 * the dot field behind is the backdrop.
 */
export function FlagshipHero({
  theme,
  pitch,
  when,
  venue,
  city,
  edition,
  action,
}: {
  theme: string;
  pitch?: string;
  /** The date as it should read, e.g. "February 20, 2027". */
  when?: string;
  venue?: string;
  city?: string;
  /** e.g. "Edition 3". */
  edition?: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="flex min-h-svh flex-col px-6 pt-24 pb-7 md:pt-28">
      <div className="grid grid-cols-4 gap-x-6 gap-y-8 md:grid-cols-12">
        {(when || venue) && (
          <p data-dot-clear className="col-span-4 flex flex-col text-heading font-medium md:col-span-5">
            {when && <span>{when}</span>}
            {venue && <span className="text-ink-300">{venue}</span>}
            {city && <span className="text-ink-300">{city}</span>}
          </p>
        )}
        {pitch && (
          <p data-dot-clear className="col-span-4 max-w-sm text-heading text-balance text-ink-300 md:col-span-4 md:col-start-9">
            {pitch}
          </p>
        )}
      </div>

      {/* "Flagship" names the page, so it never reads as the home page; the
          theme is the title. Lines, not chars: split chars lose their kerning
          and shift when the split is undone. No mask: at this size the
          slide-up through a mask reads as the letters being cut off. */}
      <h1 className="mt-auto pt-16 text-mega font-medium">
        <SplitReveal as="span" by="lines" mask={false} onScroll={false} className="block text-muted">
          {"Flagship"}
        </SplitReveal>
        <SplitReveal as="span" by="lines" mask={false} delay={0.15} onScroll={false} className="block">
          {theme}
        </SplitReveal>
      </h1>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mt-12">
        {action && <SquareLink href={action.href}>{action.label}</SquareLink>}
        {edition && (
          <p data-dot-clear className="text-small text-muted">
            {`TEDxHarvardSquare · ${edition}`}
          </p>
        )}
      </div>
    </section>
  );
}
