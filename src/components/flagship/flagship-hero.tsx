import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";

/**
 * The Flagship page's first screen, set as a poster: the date and venue in
 * the top corner from the first frame, a short pitch opposite, and the theme
 * stacked huge along the bottom, its second line stepped in. No photograph;
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
  /** The date as it should read, e.g. "Saturday, February 20, 2027". */
  when?: string;
  venue?: string;
  city?: string;
  /** e.g. "Edition 3". */
  edition?: string;
  action?: { label: string; href: string };
}) {
  // First word on its own line, the rest stepped in beneath it.
  const [first, ...rest] = theme.split(" ");

  return (
    <section className="flex min-h-svh flex-col px-6 pt-24 pb-7 md:pt-28">
      <div className="grid grid-cols-4 gap-x-6 gap-y-8 md:grid-cols-12">
        {(when || venue) && (
          <p data-dot-clear className="col-span-4 flex flex-col md:col-span-5">
            {when && <span className="text-title font-medium">{when}</span>}
            {venue && <span className="mt-2 text-heading text-ink-300">{venue}</span>}
            {city && <span className="text-heading text-ink-300">{city}</span>}
          </p>
        )}
        {pitch && (
          <p data-dot-clear className="col-span-4 max-w-md text-lead text-balance text-ink-200 md:col-span-4 md:col-start-9">
            {pitch}
          </p>
        )}
      </div>

      <SplitReveal as="h1" by="chars" onScroll={false} className="mt-auto pt-16 text-mega font-medium">
        <span className="block">{first}</span>
        {rest.length > 0 && <span className="block md:pl-32">{rest.join(" ")}</span>}
      </SplitReveal>

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
