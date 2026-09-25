import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home2/dot-field";
import { FitHeadline } from "@/components/home2/fit-headline";
import { Motto } from "@/components/home2/motto";
import { PartnerLogos } from "@/components/home2/partner-logos";
import { PhotoStrip } from "@/components/home2/photo-strip";
import { PixelPhoto } from "@/components/home2/pixel-photo";
import { SquareLink } from "@/components/home2/square-link";
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

/** How many portraits the past-speakers section shows. */
const PORTRAITS = 8;

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
  const portraits = archive.filter((speaker) => speaker.headshot).slice(0, PORTRAITS);
  const talkCount = archive.filter((speaker) => speaker.talk).length;
  const editionCount = new Set(archive.map((speaker) => speaker.editionYear)).size;
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

        {/* Flagship: the dot field draws the edition number as it arrives. */}
        {edition && (
          <section className="grid grid-cols-4 gap-x-6 px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col gap-10 md:col-span-6 md:pt-16">
              {edition.theme && (
                <Reveal as="h2" className="text-display font-medium text-balance">
                  {edition.theme}
                </Reveal>
              )}
              <Reveal as="dl" className="grid max-w-lg grid-cols-3 border-t border-rule text-small">
                <dt className="border-b border-rule py-3 text-muted">Flagship</dt>
                <dd className="col-span-2 border-b border-rule py-3 tabular-nums">{`Edition ${pad(edition.number)}`}</dd>
                <dt className="border-b border-rule py-3 text-muted">When</dt>
                <dd className="col-span-2 border-b border-rule py-3 tabular-nums">
                  {edition.date
                    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(edition.date))
                    : `${edition.year}, date to be announced`}
                </dd>
                <dt className="border-b border-rule py-3 text-muted">Where</dt>
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

        {/* Past speakers: a contact sheet of recent faces and a way into the archive. */}
        {archive.length > 0 && (
          <section className="grid grid-cols-4 gap-x-6 gap-y-12 px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col items-start gap-10 md:col-span-5">
              <Reveal as="h2" className="text-display font-medium text-balance">
                {`${archive.length} past speakers. ${talkCount} talks. ${editionCount} ${editionCount === 1 ? "stage" : "stages"}.`}
              </Reveal>
              <Reveal>
                <SquareLink href="/speakers" variant="secondary">
                  Watch the talks
                </SquareLink>
              </Reveal>
            </div>
            {portraits.length > 0 && (
              <Reveal as="ul" className="col-span-4 grid grid-cols-4 gap-1 self-end md:col-span-7">
                {portraits.map((speaker) => (
                  <li key={speaker.slug}>
                    <figure>
                      <PixelPhoto
                        image={{ ...speaker.headshot!, alt: speaker.headshot!.alt || `Portrait of ${speaker.name}` }}
                        sizes="(min-width: 768px) 15vw, 25vw"
                        className="aspect-square w-full"
                      />
                      <figcaption className="mt-2 hidden truncate text-small text-muted md:block">
                        {speaker.name}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </Reveal>
            )}
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
