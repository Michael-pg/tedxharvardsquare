import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home2/dot-field";
import { FitHeadline } from "@/components/home2/fit-headline";
import { Motto } from "@/components/home2/motto";
import { PhotoStrip } from "@/components/home2/photo-strip";
import { SpeakerIndex } from "@/components/home2/speaker-index";
import { SquareLink } from "@/components/home2/square-link";
import { getCurrentEdition, getHomePage, getSiteSettings, getSpeakerArchive } from "@/content";

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

/** A small red square beside a label: the site's signal mark. */
function Label({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2.5 text-label text-muted uppercase">
      <span aria-hidden="true" className="size-2 bg-brand" />
      {children}
    </p>
  );
}

/**
 * The motto is the first sentence of the mission statement, broken into its
 * clauses: the first three on their own lines, the outcome kept whole.
 */
function mottoLines(missionStatement: string) {
  const sentence = missionStatement.split(/(?<=\.)\s/)[0] ?? missionStatement;
  const clauses = sentence.split(", ");
  if (clauses.length < 4) return [sentence];
  return [...clauses.slice(0, 3).map((c) => `${c},`), clauses.slice(3).join(", ")];
}

export default async function Home2() {
  const [site, home, edition, speakers] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getCurrentEdition(),
    getSpeakerArchive(),
  ]);

  const headline = edition?.theme ?? site.tagline;
  const editionLabel = edition
    ? [`Edition ${pad(edition.number)}`, [edition.venue?.city, edition.year].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(" — ")
    : undefined;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  const editionYears = new Set(speakers.map((s) => s.editionYear).filter(Boolean));

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
          <div data-dot-clear className="mt-8 flex max-w-md flex-col gap-4 md:mt-10">
            {editionLabel && <Label>{editionLabel}</Label>}
            {edition?.themeStatement && (
              <p className="text-heading font-medium text-balance">{edition.themeStatement}</p>
            )}
          </div>
          <div data-dot-clear className="mt-auto flex flex-wrap gap-2 pt-16">
            {site.earlyAccessUrl && <SquareLink href={site.earlyAccessUrl}>Get early access</SquareLink>}
            <SquareLink href="/speakers" variant="secondary">
              Past talks
            </SquareLink>
          </div>
        </section>

        {/* The motto, lit word by word as it scrolls through. */}
        <section className="px-6 py-24 md:py-40">
          <Reveal className="mb-10">
            <Label>What we believe</Label>
          </Reveal>
          <Motto lines={mottoLines(site.missionStatement)} />
        </section>

        {home.heroImages.length > 0 && (
          <section aria-label="Photographs from past editions" className="py-12 md:py-20">
            <PhotoStrip images={home.heroImages} />
          </section>
        )}

        {/* Flagship: the dot field draws the edition number as it arrives. */}
        {edition && (
          <section className="grid grid-cols-4 gap-x-6 px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col gap-10 md:col-span-6 md:pt-16">
              <Reveal>
                <Label>{`Flagship — Edition ${pad(edition.number)}`}</Label>
              </Reveal>
              {edition.theme && (
                <Reveal as="h2" className="text-display font-medium text-balance">
                  {edition.theme}
                </Reveal>
              )}
              <Reveal as="dl" className="grid max-w-lg grid-cols-3 border-t border-rule text-small">
                <dt className="border-b border-rule py-3 text-label text-muted uppercase">When</dt>
                <dd className="col-span-2 border-b border-rule py-3 tabular-nums">
                  {edition.date
                    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(edition.date))
                    : `${edition.year}, date to be announced`}
                </dd>
                <dt className="border-b border-rule py-3 text-label text-muted uppercase">Where</dt>
                <dd className="col-span-2 border-b border-rule py-3">
                  {venueKnown
                    ? `${edition.venue?.name}, ${edition.venue?.city}`
                    : `${edition.venue?.city ?? "Venue"}, venue to be announced`}
                </dd>
              </Reveal>
              <Reveal className="flex flex-wrap gap-2">
                {site.earlyAccessUrl && <SquareLink href={site.earlyAccessUrl}>Get early access</SquareLink>}
                <SquareLink href="/faq" variant="secondary">
                  Questions
                </SquareLink>
              </Reveal>
            </div>
            {/* Drawn by the dot field; the text itself is never painted. */}
            <p
              aria-hidden="true"
              data-dot-glyph
              className="col-span-4 self-center justify-self-end text-numeral font-medium text-transparent select-none md:col-span-6"
            >
              {pad(edition.number)}
            </p>
          </section>
        )}

        {/* A nod to everyone who has stood on the stage. */}
        {speakers.length > 0 && (
          <section className="px-6 py-24 md:py-40">
            <Reveal className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
              <Label>
                {`On our stage — ${speakers.length} speakers across ${editionYears.size} editions`}
              </Label>
            </Reveal>
            <SpeakerIndex speakers={speakers} />
            <Reveal className="mt-14">
              <SquareLink href="/speakers" variant="secondary">
                All speakers and talks
              </SquareLink>
            </Reveal>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
