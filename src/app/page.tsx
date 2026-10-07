import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home/dot-field";
import { FitHeadline } from "@/components/home/fit-headline";
import { Motto } from "@/components/home/motto";
import { PhotoStrip } from "@/components/home/photo-strip";
import { FlagshipPhoto } from "@/components/home/flagship-photo";
import { PastTalks } from "@/components/home/past-talks";
import { SquareLink } from "@/components/ui/square-link";
import { getCurrentEdition, getHomePage, getSiteSettings, getSpeakerArchive } from "@/content";
import { TEDX_PROGRAM_URL, whatIsTedx } from "@/content/tedx";

/**
 * The home page: the dot-system direction worked out at `/home2` (which now
 * redirects here). Design history: `docs/HOME2-PLAN.md`.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The motto is the mission statement. Its first sentence is the statement,
 * broken into its clauses: the first three on their own lines, the outcome
 * kept whole. The rest is the answer, set smaller beneath it.
 */
function motto(missionStatement: string) {
  const [sentence = missionStatement, ...rest] = missionStatement.split(/(?<=\.)\s/);
  const clauses = sentence.split(", ");
  const lines =
    clauses.length < 4 ? [sentence] : [...clauses.slice(0, 3).map((c) => `${c},`), clauses.slice(3).join(", ")];
  return { lines, coda: rest.join(" ") || undefined };
}

/** How many recorded talks the home page points to. */
const FEATURED_TALKS = 4;

export default async function Home() {
  const [site, home, edition, archive] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getCurrentEdition(),
    getSpeakerArchive(),
  ]);

  const headline = edition?.theme ?? site.tagline;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  const editionLine = edition
    ? [`Edition ${pad(edition.number)}`, venueKnown ? edition.venue?.name : edition.venue?.city, edition.year]
        .filter(Boolean)
        .join(" · ")
    : undefined;
  const { lines, coda } = motto(site.missionStatement);
  // The talks picked in Studio, in their order; until some are picked, talks
  // with a stage photo and a published video first, so most rows show the
  // talk itself and play something.
  const talkRank = (speaker: (typeof archive)[number]) =>
    Number(Boolean(speaker.talk?.still)) * 2 + Number(Boolean(speaker.talk?.videoUrl));
  const pickedTalks = home.featuredTalkSlugs
    .map((slug) => archive.find((speaker) => speaker.talk?.slug === slug))
    .filter((speaker) => speaker?.talk?.title) as typeof archive;
  const featuredTalks = (
    pickedTalks.length > 0
      ? pickedTalks
      : archive.filter((speaker) => speaker.talk?.title).sort((a, b) => talkRank(b) - talkRank(a))
  ).slice(0, FEATURED_TALKS);
  const talkCount = archive.filter((speaker) => speaker.talk).length;
  const editionCount = new Set(archive.map((speaker) => speaker.editionYear)).size;
  // A speaker lit on a dark stage; the second hero frame is one.
  const flagshipPhoto = home.flagshipPhoto ?? home.heroImages[1];

  return (
    <>
      <SiteNav />
      <DotField />

      <main className="relative">
        {/* Hero: one line across the top, the dot field in the lower right. */}
        <section className="flex min-h-svh flex-col px-6 pt-24 pb-7 md:pt-28">
          <div>
            <FitHeadline>{headline}</FitHeadline>
          </div>
          {edition?.themeStatement && (
            <p data-dot-clear className="mt-8 max-w-md text-heading font-medium text-balance md:mt-10">
              {edition.themeStatement}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-16">
            <div data-dot-clear className="flex flex-wrap gap-2">
              {site.newsletterUrl && <SquareLink href={site.newsletterUrl}>Subscribe</SquareLink>}
              <SquareLink href="/speakers" variant="secondary">
                Past talks
              </SquareLink>
            </div>
            {editionLine && (
              <p data-dot-clear className="text-small text-muted">
                {editionLine}
              </p>
            )}
          </div>
        </section>

        {/* The motto, lit word by word as it scrolls through. */}
        <section aria-label="What we believe" className="px-6 py-24 md:py-40">
          <Motto lines={lines} coda={coda} />
        </section>

        {home.heroImages.length > 0 && (
          <section aria-label="Photographs from past editions" className="py-12 md:py-20">
            <PhotoStrip images={home.heroImages} />
          </section>
        )}

        {/* Flagship: the year leads, since the hero already carries the theme. The
            photo sits left on desktop, breaking the run of left-aligned text. */}
        {edition && (
          <section className="grid grid-cols-4 items-center gap-x-6 gap-y-12 px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col items-start gap-6 md:col-span-5 md:col-start-8 md:row-start-1">
              <Reveal as="h2" className="text-display font-medium text-balance">
                {`Flagship ${edition.year}`}
              </Reveal>
              {/* The facts as a sentence, not a table. */}
              <Reveal as="p" className="max-w-md text-lead text-balance text-muted">
                <span className="text-foreground">
                  {edition.theme ? `Edition ${edition.number}: ${edition.theme}.` : `Edition ${edition.number}.`}
                </span>{" "}
                {[
                  venueKnown
                    ? `At ${edition.venue?.name}, ${edition.venue?.city}.`
                    : `In ${edition.venue?.city ?? "Cambridge"}, venue to be announced.`,
                  edition.date
                    ? `${new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(edition.date))}.`
                    : "Date to be announced.",
                ].join(" ")}
              </Reveal>
              <Reveal className="mt-4 flex flex-wrap gap-2">
                <SquareLink href="/flagship">{edition.theme ? `Explore ${edition.theme}` : `Flagship ${edition.year}`}</SquareLink>
                {site.newsletterUrl && (
                  <SquareLink href={site.newsletterUrl} variant="secondary">
                    Subscribe
                  </SquareLink>
                )}
              </Reveal>
            </div>
            {flagshipPhoto && (
              <FlagshipPhoto image={flagshipPhoto} className="col-span-4 w-full md:col-span-6 md:col-start-1 md:row-start-1" />
            )}
          </section>
        )}

        {/* Past talks: an archive to watch, dated, so it never reads as the next lineup. */}
        {featuredTalks.length > 0 && (
          <section className="grid grid-cols-4 gap-x-6 gap-y-12 px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col items-start gap-6 md:col-span-5">
              <Reveal as="h2" className="text-display font-medium text-balance">
                Watch past talks
              </Reveal>
              <Reveal as="p" className="text-lead text-muted">
                {`${talkCount} talks from ${editionCount} ${editionCount === 1 ? "edition" : "editions"} so far.`}
              </Reveal>
              <Reveal className="mt-4">
                <SquareLink href="/speakers" variant="secondary">
                  All speakers and talks
                </SquareLink>
              </Reveal>
            </div>
            <div data-dot-clear className="col-span-4 md:col-span-7">
              <Reveal>
                <PastTalks speakers={featuredTalks} />
              </Reveal>
            </div>
          </section>
        )}

        {/* What is TEDx: the TEDx licence requires this text and a visible
            link to the TEDx program on the homepage. Partner logos may not
            appear here; they live on /sponsor. */}
        <section aria-labelledby="what-is-tedx" className="grid grid-cols-4 gap-x-6 gap-y-8 px-6 pt-12 pb-24 md:grid-cols-12 md:pt-24 md:pb-40">
          <Reveal as="h2" className="col-span-4 text-title font-medium md:col-span-4">
            <span id="what-is-tedx" data-dot-clear>
              What is TEDx?
            </span>
          </Reveal>
          <Reveal className="col-span-4 flex flex-col items-start gap-8 md:col-span-7 md:col-start-6">
            <p data-dot-clear className="max-w-3xl text-body text-ink-300">
              {whatIsTedx(site.name)}
            </p>
            <div data-dot-clear>
              <SquareLink href={TEDX_PROGRAM_URL} variant="secondary">
                About the TEDx program
              </SquareLink>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
