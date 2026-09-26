import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home2/dot-field";
import { FitHeadline } from "@/components/home2/fit-headline";
import { Motto } from "@/components/home2/motto";
import { PartnerLogos } from "@/components/home2/partner-logos";
import { PhotoStrip } from "@/components/home2/photo-strip";
import { HalftonePhoto } from "@/components/home2/halftone-photo";
import { PastTalks } from "@/components/home2/past-talks";
import { SquareLink } from "@/components/ui/square-link";
import { getCurrentEdition, getHomePage, getPartners, getSiteSettings, getSpeakerArchive } from "@/content";

/**
 * A second home page, built alongside the current one so the dot-system
 * direction can be judged on real content. Not linked and not indexed; it
 * replaces `/` once the owner approves. Plan: `docs/HOME2-PLAN.md`.
 */
export const metadata: Metadata = {
  title: "Home 2 (preview)",
  robots: { index: false, follow: false },
};

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

export default async function Home2() {
  const [site, home, edition, archive, partners] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getCurrentEdition(),
    getSpeakerArchive(),
    getPartners(),
  ]);

  const headline = edition?.theme ?? site.tagline;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  const editionLine = edition
    ? [`Edition ${pad(edition.number)}`, venueKnown ? edition.venue?.name : edition.venue?.city, edition.year]
        .filter(Boolean)
        .join(" · ")
    : undefined;
  const { lines, coda } = motto(site.missionStatement);
  // Talks with a stage photo and a published video first, so most rows show
  // the talk itself and play something.
  const talkRank = (speaker: (typeof archive)[number]) =>
    Number(Boolean(speaker.talk?.still)) * 2 + Number(Boolean(speaker.talk?.videoUrl));
  const featuredTalks = archive
    .filter((speaker) => speaker.talk?.title)
    .sort((a, b) => talkRank(b) - talkRank(a))
    .slice(0, FEATURED_TALKS);
  const talkCount = archive.filter((speaker) => speaker.talk).length;
  const editionCount = new Set(archive.map((speaker) => speaker.editionYear)).size;
  // The edition's own poster when Studio has one, else a photo from the last one.
  const flagshipPhoto = edition?.poster ?? home.heroImages[0];
  const logoPartners = partners.filter((partner) => partner.logoOnDark ?? partner.logo);

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
              {site.earlyAccessUrl && <SquareLink href={site.earlyAccessUrl}>Get early access</SquareLink>}
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

        {/* Flagship: a photograph from the last edition, printed in red dots. */}
        {edition && (
          <section className="grid grid-cols-4 items-center gap-x-6 gap-y-12 px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col items-start gap-6 md:col-span-5">
              {edition.theme && (
                <Reveal as="h2" className="text-display font-medium text-balance">
                  {edition.theme}
                </Reveal>
              )}
              {/* The facts as a sentence, not a table. */}
              <Reveal as="p" className="max-w-md text-lead text-balance text-muted">
                <span className="text-foreground">{`Flagship, edition ${edition.number}.`}</span>{" "}
                {[
                  venueKnown
                    ? `${edition.year} at ${edition.venue?.name}, ${edition.venue?.city}.`
                    : `${edition.year} in ${edition.venue?.city ?? "Cambridge"}, venue to be announced.`,
                  edition.date
                    ? `${new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(edition.date))}.`
                    : "Date to be announced.",
                ].join(" ")}
              </Reveal>
              <Reveal className="mt-4 flex flex-wrap gap-2">
                {site.earlyAccessUrl && <SquareLink href={site.earlyAccessUrl}>Get early access</SquareLink>}
                <SquareLink href="/faq" variant="secondary">
                  Questions
                </SquareLink>
              </Reveal>
            </div>
            {flagshipPhoto && (
              <HalftonePhoto image={flagshipPhoto} className="col-span-4 w-full md:col-span-7" />
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

        {logoPartners.length > 0 && (
          <section aria-label="Partners" className="px-6 pb-24 md:pb-40">
            <Reveal>
              <PartnerLogos lead="With thanks to our partners" partners={logoPartners} />
            </Reveal>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
