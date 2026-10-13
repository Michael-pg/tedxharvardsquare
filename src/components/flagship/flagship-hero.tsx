import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Flagship page's first screen, set as a poster: the edition, date and
 * venue in the top corner from the first frame, a short pitch opposite, and
 * "Flagship" huge along the bottom with the theme beneath it. The home page
 * leads with the theme, so here the page's name leads instead. No photograph;
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
  /** The edition number, shown as "Edition 03". */
  edition?: number;
  action?: { label: string; href: string };
}) {
  return (
    <section className="flex min-h-svh flex-col px-6 pt-24 pb-7 md:pt-28">
      <div className="grid grid-cols-4 gap-x-6 gap-y-8 md:grid-cols-12">
        <p data-dot-clear className="col-span-4 flex flex-col text-heading font-medium md:col-span-5">
          {edition && <span>{`Edition ${pad(edition)}`}</span>}
          {when && <span className={edition ? "mt-3" : undefined}>{when}</span>}
          {venue && <span className="text-ink-300">{venue}</span>}
          {city && <span className="text-ink-300">{city}</span>}
        </p>
        {pitch && (
          <p data-dot-clear className="col-span-4 max-w-sm text-heading text-balance text-ink-300 md:col-span-4 md:col-start-9">
            {pitch}
          </p>
        )}
      </div>

      {/* Lines, not chars: split chars lose their kerning and shift when the
          split is undone. */}
      <h1 className="mt-auto pt-16 font-medium">
        <SplitReveal as="span" by="lines" onScroll={false} className="block text-mega">
          {"Flagship"}
        </SplitReveal>
        <span className="sr-only">{": "}</span>
        <SplitReveal as="span" by="lines" delay={0.15} onScroll={false} className="mt-3 block text-statement text-balance md:mt-4">
          {theme}
        </SplitReveal>
      </h1>

      {action && (
        <div className="mt-10 md:mt-12">
          <SquareLink href={action.href}>{action.label}</SquareLink>
        </div>
      )}
    </section>
  );
}
