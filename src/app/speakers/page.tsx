import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home/dot-field";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SquareLink } from "@/components/ui/square-link";
import { SpeakerArchive, type ArchiveEdition } from "@/components/speakers/speaker-archive";
import { getEditions, getSpeakerArchive, getSpeakers } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Speakers",
    description:
      "Meet the innovators, scientists, founders, and leaders who have taken the TEDxHarvardSquare stage. Exploring AI, biotech, climate, equity, and human potential.",
    path: "/speakers",
  });
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/**
 * The speaker archive: every edition on one page, newest first. The page-wide
 * dot field, faded back as on Flagship, lives only in the opening: it draws
 * the next edition's number in dots, then stops above the archive so the
 * portraits' own halftone is the only red in the lineups.
 */
export default async function SpeakersPage() {
  const [editions, speakers, everyone] = await Promise.all([getEditions(), getSpeakerArchive(), getSpeakers()]);

  // Editions with a lineup, newest first. The archive query already orders
  // speakers by lineup position, so filtering keeps display order.
  const archive: ArchiveEdition[] = editions
    .map((edition) => ({
      slug: edition.slug,
      number: edition.number,
      year: edition.year,
      theme: edition.theme,
      when: edition.date ? dateFormat.format(new Date(edition.date)) : String(edition.year),
      venue: edition.venue?.name && edition.venue.name !== "Venue TBA" ? edition.venue.name : undefined,
      speakers: speakers.filter((s) => s.editionYear === edition.year),
      performers: everyone
        .filter((p) => p.kind === "performer" && p.editionSlug === edition.slug)
        .map((p) => ({ name: p.name, credit: p.credit })),
    }))
    .filter((edition) => edition.speakers.length > 0);

  // The next edition, until its lineup is in the archive.
  const upcoming = editions.find(
    (e) => e.status !== "past" && !archive.some((a) => a.slug === e.slug),
  );
  const upcomingWhen = upcoming?.date ? dateFormat.format(new Date(upcoming.date)) : upcoming?.page?.month;
  const upcomingVenue = upcoming?.venue?.name !== "Venue TBA" ? upcoming?.venue?.name : undefined;

  return (
    <>
      <SiteNav />
      <DotField strength={0.55} />
      <main className="relative px-6 pt-40 pb-32 md:pt-56">
        <header data-dot-clear className="mb-20 max-w-4xl md:mb-28">
          <Reveal className="mb-6">
            <Eyebrow>The archive</Eyebrow>
          </Reveal>
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            Speakers
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 text-lead text-ink-300">
            Hear from innovators working at the frontier of AI, biology, creativity,
            climate, culture, and human connection. These are blueprints for what
            flourishing could look like in the years ahead.
          </SplitReveal>
        </header>

        {upcoming ? (
          <section
            aria-labelledby="next-edition"
            className="mb-24 grid grid-cols-4 items-end gap-x-6 gap-y-8 md:mb-32 md:grid-cols-12"
          >
            {/* The field draws this number in ordered red dots; the text itself is invisible. */}
            <p
              aria-hidden
              data-dot-glyph
              className="col-span-4 -ml-2 text-numeral font-medium text-transparent tabular-nums select-none md:col-span-6"
            >
              {String(upcoming.number).padStart(2, "0")}
            </p>
            <Reveal className="col-span-4 md:col-span-6 md:col-start-7 md:pb-6">
              <div data-dot-clear className="flex flex-col items-start gap-4">
              <Eyebrow>Next</Eyebrow>
              <h2 id="next-edition" className="text-title font-medium text-balance">
                {upcoming.theme ? `Edition ${upcoming.number}: ${upcoming.theme}` : `Edition ${upcoming.number}`}
              </h2>
              <p className="text-lead text-ink-300">
                {[upcomingWhen, upcomingVenue].filter(Boolean).join(" · ")}
              </p>
              <p className="text-body text-muted">
                {upcoming.page?.speakersNote ?? "Lineup to be announced."}
              </p>
              <div className="mt-4">
                <SquareLink href="/flagship" variant="secondary">
                  About the Flagship
                </SquareLink>
              </div>
              </div>
            </Reveal>
          </section>
        ) : null}

        {archive.length > 0 ? (
          // The dot field fades out above the archive and stays out of it.
          <div data-dot-stop className="relative bg-background">
            <SpeakerArchive editions={archive} />
          </div>
        ) : (
          <p className="text-body text-muted">The speaker archive is being assembled.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
