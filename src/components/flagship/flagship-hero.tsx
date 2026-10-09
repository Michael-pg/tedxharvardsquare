import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" });

/** "2027-02-20" → ["2.20.", "27"]: the date as the dot field draws it. */
function shortDate(iso: string) {
  const date = new Date(iso);
  return [`${date.getUTCMonth() + 1}.${date.getUTCDate()}.`, String(date.getUTCFullYear()).slice(2)];
}

/**
 * The Flagship page's first screen, led by the date. The dot field draws it
 * across the full width in ordered red, assembling out of the loose field as
 * the page opens; the theme and the practical line sit beneath it. No
 * photograph: the room appears further down, where there is space for it.
 */
export function FlagshipHero({
  theme,
  statement,
  date,
  place,
  action,
}: {
  theme: string;
  statement?: string;
  /** ISO date. Without one the hero is the theme alone. */
  date?: string;
  /** Venue and city, e.g. "Arrow Street Arts, Cambridge". */
  place?: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="relative flex min-h-svh flex-col justify-end px-6 pt-32 pb-7 md:pt-40">
      {date && (
        // The field draws this; the text itself is invisible. The date is
        // spelled out for everyone in the line below.
        <p
          aria-hidden
          data-dot-glyph
          className="-ml-1 mb-12 text-date-stack font-medium whitespace-nowrap text-transparent tabular-nums select-none md:mb-16 md:-ml-3 md:text-date"
        >
          {shortDate(date).map((part) => (
            <span key={part} className="block md:inline">
              {part}
            </span>
          ))}
        </p>
      )}

      <div className="grid grid-cols-4 items-end gap-x-6 gap-y-10 md:grid-cols-12">
        <div data-dot-clear className="col-span-4 md:col-span-8">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-statement font-medium text-balance">
            {theme}
          </SplitReveal>
          {statement && (
            <SplitReveal as="p" delay={0.25} onScroll={false} className="mt-6 max-w-xl text-lead text-balance text-ink-200">
              {statement}
            </SplitReveal>
          )}
        </div>
        <div data-dot-clear className="col-span-4 flex flex-col items-start gap-6 md:col-span-4 md:col-start-9 md:items-end md:pb-1 md:text-right">
          {(date || place) && (
            <p className="text-heading font-medium">
              {date && <span className="block">{longDate.format(new Date(date))}</span>}
              {place && <span className="block text-ink-300">{place}</span>}
            </p>
          )}
          {action && <SquareLink href={action.href}>{action.label}</SquareLink>}
        </div>
      </div>
    </section>
  );
}
