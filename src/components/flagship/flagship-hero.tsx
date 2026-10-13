import { SplitReveal } from "@/components/motion/split-reveal";
import { SquareLink } from "@/components/ui/square-link";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Flagship page's first screen, set as a poster: "Flagship", the edition,
 * date and venue in the top corner from the first frame, a short pitch
 * opposite, and the theme alone, huge, along the bottom. No photograph; the
 * dot field behind is the backdrop.
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
        {/* "Flagship" names the page, so it never reads as the home page; it
            leads the details rather than competing with the theme. */}
        <p data-dot-clear className="col-span-4 flex flex-col text-heading font-medium md:col-span-5">
          <span>{edition ? `Flagship · Edition ${pad(edition)}` : "Flagship"}</span>
          {when && <span className="mt-3">{when}</span>}
          {venue && <span className="text-ink-300">{venue}</span>}
          {city && <span className="text-ink-300">{city}</span>}
        </p>
        {pitch && (
          <p data-dot-clear className="col-span-4 max-w-sm text-heading text-balance text-ink-300 md:col-span-4 md:col-start-9">
            {pitch}
          </p>
        )}
      </div>

      {/* The theme is the title. Lines, not chars: split chars lose their
          kerning and shift when the split is undone. */}
      <h1 className="mt-auto pt-16 text-poster font-medium text-balance">
        <span className="sr-only">{"Flagship: "}</span>
        <SplitReveal as="span" by="lines" onScroll={false} className="block">
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
