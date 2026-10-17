import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home/dot-field";
import { FlagshipHero } from "@/components/flagship/flagship-hero";
import { EditionList, type PastEditionRow } from "@/components/flagship/edition-list";
import { LineupPlaceholder } from "@/components/flagship/lineup-placeholder";
import { SpeakerNames } from "@/components/flagship/speaker-names";
import { TopicMarquee } from "@/components/flagship/topic-marquee";
import { Venue } from "@/components/flagship/venue";
import { TheDay } from "@/components/flagship/the-day";
import { Connections, type Connection } from "@/components/flagship/connections";
import { SquareLink } from "@/components/ui/square-link";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCurrentEdition,
  getHomePage,
  getPageCopy,
  getPastEditions,
  getSiteSettings,
  getSpeakerArchive,
  getSpeakers,
  getTopics,
  type PastEdition,
} from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { editionJsonLd } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const edition = await getCurrentEdition();
  return pageMetadata({
    title: "Flagship",
    description: edition?.theme
      ? `TEDxHarvardSquare ${edition.year}: ${edition.theme}. A day of talks, Discovery Sessions and conversations in Cambridge, Massachusetts.`
      : "TEDxHarvardSquare's annual conference in Cambridge, Massachusetts: a day of talks, Discovery Sessions and conversations.",
    path: "/flagship",
  });
}

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

/** A crowd, rounded the way people say it: 375 is "Nearly 400", 420 "Over 400". */
const roughly = (n: number) => {
  const hundred = Math.round(n / 100) * 100;
  if (n < 100 || n === hundred) return String(n);
  return n < hundred ? `Nearly ${hundred}` : `Over ${hundred}`;
};

const monthYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * How the last Flagship went, for the grid, in the past tense so it never
 * reads as this edition: "Nearly 400" / "in the room at Arrow Street Arts
 * last February. It sold out."
 */
const lastTime = (edition?: PastEdition) => {
  if (!edition || (!edition.soldOut && !edition.attendance)) return undefined;
  const when = edition.date ? `in ${monthYear.format(new Date(edition.date))}` : `in ${edition.year}`;
  const at = edition.venue ? ` at ${edition.venue.name}` : "";
  const soldOut = edition.soldOut ? " It sold out." : "";
  return edition.attendance
    ? { headline: roughly(edition.attendance), line: `in the room${at} ${when}.${soldOut}` }
    : { headline: `Edition ${edition.number}`, line: `sold out${at} ${when}.` };
};

/** A past edition, written out for "Over the years". */
const toRow = (edition: PastEdition): PastEditionRow => ({
  number: edition.number,
  year: edition.year,
  title: edition.theme ?? `Edition ${edition.number}`,
  when: edition.date ? longDate.format(new Date(edition.date)) : undefined,
  where: edition.venue ? `${edition.venue.name}, ${edition.venue.city}` : undefined,
  recap: edition.recap,
  figures: [
    edition.talkCount > 0 && `${edition.talkCount} talks`,
    edition.attendance && `${roughly(edition.attendance)} attended`,
    edition.soldOut && "sold out",
  ].filter((figure): figure is string => Boolean(figure)),
  href: `/speakers#edition-${edition.number}`,
  image: edition.poster ?? edition.still,
});

/**
 * Flagship: the annual conference, led by the current edition. The poster
 * (name, theme, date, venue); the day (the reasons to come as photos, each
 * with a fact); the lineup; the topics as a moving band; the venue with the
 * ticket ask; past editions; the people in the room. Kept short above Speakers so the lineup sits
 * near the top once announced. The content comes from the edition in Studio,
 * and any part left empty is simply not shown; the headings and buttons from
 * Pages → Flagship (`words`).
 *
 * The dot field runs behind the poster and, quieter, the day, and stops at
 * Speakers.
 */
export default async function FlagshipPage() {
  const [site, words, edition, archive, home, topics, pastEditions] = await Promise.all([
    getSiteSettings(),
    getPageCopy("flagshipPage"),
    getCurrentEdition(),
    getSpeakerArchive(),
    getHomePage(),
    getTopics(),
    getPastEditions(),
  ]);
  const lineup = edition ? (await getSpeakers(edition.slug)).filter((s) => s.kind === "speaker") : [];

  const title = edition ? `TEDxHarvardSquare ${edition.year}` : "TEDxHarvardSquare";
  const copy = edition?.page;
  const date = edition?.date ? new Date(edition.date) : undefined;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  // Tickets once they are on sale; until then, the Substack newsletter.
  const joinHref = edition?.ticketUrl ?? site.newsletterUrl;
  const joinLabel = edition?.ticketUrl ? words.ticketsLabel : words.earlyAccessLabel;
  const showVenue = Boolean(edition?.venue && venueKnown);
  const tickets = edition && (
    <>
      {copy && copy.included.length > 0 ? (
        <ul className="w-full">
          {copy.included.map((item) => (
            <li key={item} className="border-b border-rule py-3 text-body last:border-b-0">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="max-w-md text-body text-ink-200">
          {words.notOnSale}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {joinHref && <SquareLink href={joinHref}>{joinLabel}</SquareLink>}
        <SquareLink href="/faq" variant="secondary">
          {words.questionsLabel}
        </SquareLink>
      </div>
    </>
  );

  const connections: Connection[] = [
    { title: words.connectionsHouseTitle, body: words.connectionsHouseBody, href: "/house" },
    { title: words.connectionsSponsorTitle, body: words.connectionsSponsorBody, href: "/sponsor" },
    ...(site.newsletterUrl
      ? [{ title: words.connectionsListTitle, body: words.connectionsListBody, href: site.newsletterUrl }]
      : []),
  ];

  // Past speakers' portraits, printed past recognition, stand in for the lineup.
  const placeholders = archive.flatMap((s) => (s.headshot?.src ? [s.headshot] : [])).slice(0, 4);
  const eventJsonLd = edition && editionJsonLd(site, edition, copy?.heroImage ?? home.flagshipPhoto ?? copy?.reasons[0]?.image);

  return (
    <>
      {eventJsonLd && <JsonLd data={eventJsonLd} />}
      <SiteNav />
      <DotField strength={0.8} />

      <main id="main" className="relative">
        <FlagshipHero
          title={words.title}
          theme={edition?.theme ?? "Flagship"}
          pitch={edition?.themeStatement}
          when={date ? longDate.format(date) : copy?.month}
          venue={venueKnown ? edition?.venue?.name : undefined}
          city={edition?.venue ? `${edition.venue.city}, ${edition.venue.state}` : copy?.place}
          action={joinHref ? { label: joinLabel, href: joinHref } : undefined}
        />

        {/* The day: the reasons as photos, each with a fact. The hero's dot
            field carries on behind it, quieter, and stops at Speakers. */}
        {copy && copy.reasons.length > 0 && (
          <section data-dot-dim="0.35" aria-label="The day" className="px-6 pt-16 pb-20 md:pt-24 md:pb-32">
            <TheDay
              reasons={copy.reasons}
              audience={copy.audience}
              when={date ? longDate.format(date) : copy.month}
              where={[venueKnown ? edition?.venue?.name : undefined, edition?.venue?.city].filter(
                (line): line is string => Boolean(line),
              )}
              proof={lastTime(pastEditions[0])}
              action={joinHref ? { label: joinLabel, href: joinHref } : undefined}
            />
          </section>
        )}

        {/* The lineup as names, or the shape of one until it is announced. */}
        {edition && (
          <section data-dot-stop aria-labelledby="speakers-title" className="relative bg-background px-6 py-24 md:py-40">
            <Reveal as="h2" className="mb-12 flex flex-wrap items-baseline justify-between gap-x-6 text-statement font-medium md:mb-20 md:text-mega">
              <span id="speakers-title">{words.speakersHeading}</span>
              <span className="text-muted">{edition.year}</span>
            </Reveal>
            {lineup.length > 0 ? (
              <SpeakerNames speakers={lineup} />
            ) : (
              <>
                <Reveal>
                  <LineupPlaceholder images={placeholders} />
                </Reveal>
                <Reveal className="mt-12 flex flex-wrap items-center justify-between gap-6">
                  <p className="text-lead text-muted">{copy?.speakersNote ?? words.lineupNote}</p>
                  <div className="flex flex-wrap gap-2">
                    {site.newsletterUrl && (
                      <SquareLink href={site.newsletterUrl} variant="secondary">
                        {words.notifyLabel}
                      </SquareLink>
                    )}
                    <SquareLink href="/speakers" variant="secondary">
                      {words.pastTalksLabel}
                    </SquareLink>
                  </div>
                </Reveal>
              </>
            )}
          </section>
        )}

        {topics.length > 0 && <TopicMarquee topics={topics} />}

        {/* Where and when, and the ask: the moment someone decides to come. */}
        {edition?.venue && showVenue && (
          <Venue
            venue={edition.venue}
            image={copy?.venueImage}
            day={date ? dayMonth.format(date) : copy?.month}
            notes={copy?.venueNotes ?? []}
            mapsLabel={words.mapsLabel}
            ask={tickets}
          />
        )}

        {/* Every Flagship so far, a row each: proof, just before the ask. */}
        {pastEditions.length > 0 && (
          <section id="editions" aria-labelledby="editions-title" className="scroll-mt-16 px-6 py-20 md:py-32">
            <div className="mb-10 grid grid-cols-4 gap-x-6 gap-y-6 md:mb-14 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 self-end text-display font-medium md:col-span-8">
                <span id="editions-title">{words.editionsHeading}</span>
              </Reveal>
              <Reveal as="p" className="col-span-4 max-w-md self-end text-lead text-ink-300 md:col-span-4 md:col-start-9">
                {words.editionsIntro}
              </Reveal>
            </div>
            <EditionList editions={pastEditions.map(toRow)} watchLabel={words.watchTalksLabel} />
          </section>
        )}

        {/* The people in the room, and the ways to stay among them. */}
        <section aria-labelledby="connections-title" className="border-t border-rule px-6 py-24 md:py-40">
          <Connections
            heading={words.connectionsHeading}
            body={words.connectionsBody}
            image={copy?.audienceImage}
            links={connections}
          />
        </section>

        {/* Tickets on their own only when there is no venue to set them in. */}
        {edition && !showVenue && (
          <section aria-labelledby="tickets-title" className="px-6 py-20 md:py-32">
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 text-display font-medium md:col-span-6">
                <span id="tickets-title">{words.ticketsHeading}</span>
              </Reveal>
              <Reveal className="col-span-4 flex flex-col items-start gap-8 md:col-span-5 md:col-start-8 md:pt-6">
                {tickets}
              </Reveal>
            </div>
          </section>
        )}
        {/* The close: the dot field comes back behind one last ask, and hands
            over to the footer's glow. */}
        {edition && joinHref && (
          <section
            data-dot-return
            aria-labelledby="close-title"
            className="flex min-h-svh flex-col items-center justify-center px-6 py-32 text-center"
          >
            <Reveal as="h2" className="text-statement font-medium text-balance">
              <span id="close-title" data-dot-clear>
                {date ? longDate.format(date) : (copy?.month ?? title)}
              </span>
            </Reveal>
            {(edition.theme || showVenue) && (
              <Reveal as="p" delay={0.1} className="mt-6 text-lead text-ink-300">
                <span data-dot-clear>
                  {[edition.theme, showVenue ? `at ${edition.venue?.name}` : undefined].filter(Boolean).join(", ")}
                </span>
              </Reveal>
            )}
            <Reveal delay={0.2} className="mt-12">
              <SquareLink href={joinHref}>{joinLabel}</SquareLink>
            </Reveal>
          </section>
        )}

      </main>

      <SiteFooter />
    </>
  );
}
