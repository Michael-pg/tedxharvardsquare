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
import { SquareLink } from "@/components/ui/square-link";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCurrentEdition,
  getHomePage,
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

/** "Jeff Harmon, Shawna Young, Andrea Choe and 9 others". */
const someNames = (names: string[], shown = 3) =>
  names.length <= shown + 1
    ? new Intl.ListFormat("en-US").format(names)
    : `${names.slice(0, shown).join(", ")} and ${names.length - shown} others`;

/** A crowd, rounded the way people say it: 375 is "Nearly 400", 420 "Over 400". */
const roughly = (n: number) => {
  const hundred = Math.round(n / 100) * 100;
  if (n < 100 || n === hundred) return String(n);
  return n < hundred ? `Nearly ${hundred}` : `Over ${hundred}`;
};

const monthYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** How the last Flagship went, for the grid: "Sold out" and the crowd, when on record. */
const lastTime = (edition?: PastEdition) => {
  if (!edition || (!edition.soldOut && !edition.attendance)) return undefined;
  const crowd = edition.attendance ? `${roughly(edition.attendance)} in the room` : undefined;
  const when = edition.date ? monthYear.format(new Date(edition.date)) : String(edition.year);
  const at = edition.venue ? ` at ${edition.venue.name}` : "";
  return edition.soldOut
    ? { headline: "Sold out", line: `${crowd ? `${crowd}${at}` : `Every seat${at}`}, ${when}.` }
    : { headline: roughly(edition.attendance ?? 0), line: `In the room${at}, ${when}.` };
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
    edition.soldOut && "Sold out",
    edition.attendance && `${roughly(edition.attendance)} attended`,
  ].filter((figure): figure is string => Boolean(figure)),
  speakers: edition.speakerNames.length > 0 ? `With ${someNames(edition.speakerNames)}` : undefined,
  href: `/speakers#edition-${edition.number}`,
  image: edition.poster ?? edition.still,
});

/**
 * Flagship: the annual conference, led by the current edition. The poster
 * (name, theme, date, venue), the theme statement with who the day is for,
 * why come, then the lineup, the venue, the topics, past editions, and
 * tickets. The opening is kept short so the lineup sits close to the top once
 * it is announced. Everything comes from the edition in Studio; any part left
 * empty is simply not shown.
 *
 * The dot field runs behind the poster and the statement only, and stops at
 * Why come, so the photographs and everything after sit on plain ground.
 */
export default async function FlagshipPage() {
  const [site, edition, archive, home, topics, pastEditions] = await Promise.all([
    getSiteSettings(),
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
  // Tickets once they are on sale; until then, the early-access list.
  const joinHref = edition?.ticketUrl ?? site.earlyAccessUrl ?? site.newsletterUrl;
  const joinLabel = edition?.ticketUrl ? "Get tickets" : "Get early access";

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
          theme={edition?.theme ?? "Flagship"}
          pitch={edition?.themeStatement}
          when={date ? longDate.format(date) : copy?.month}
          venue={venueKnown ? edition?.venue?.name : undefined}
          city={edition?.venue ? `${edition.venue.city}, ${edition.venue.state}` : copy?.place}
          action={joinHref ? { label: joinLabel, href: joinHref } : undefined}
        />

        {/* The day: statement, reasons and facts in one grid. The dot field
            stops here, and comes back for the close. */}
        {copy && (copy.statement.length > 0 || copy.reasons.length > 0) && (
          <section data-dot-stop aria-label="The day" className="relative bg-background px-6 py-20 md:py-32">
            <TheDay
              statement={copy.statement}
              reasons={copy.reasons}
              format={copy.programBody[0]}
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
          <section aria-labelledby="speakers-title" className="px-6 py-24 md:py-40">
            <Reveal as="h2" className="mb-12 flex flex-wrap items-baseline justify-between gap-x-6 text-statement font-medium md:mb-20 md:text-mega">
              <span id="speakers-title">Speakers</span>
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
                  <p className="text-lead text-muted">{copy?.speakersNote ?? "Lineup coming soon."}</p>
                  <div className="flex flex-wrap gap-2">
                    {site.newsletterUrl && (
                      <SquareLink href={site.newsletterUrl} variant="secondary">
                        Get notified
                      </SquareLink>
                    )}
                    <SquareLink href="/speakers" variant="secondary">
                      Watch past talks
                    </SquareLink>
                  </div>
                </Reveal>
              </>
            )}
          </section>
        )}

        {edition?.venue && venueKnown && (
          <Venue
            venue={edition.venue}
            image={copy?.venueImage}
            day={date ? dayMonth.format(date) : copy?.month}
            notes={copy?.venueNotes ?? []}
          />
        )}

        {topics.length > 0 && (
          <section aria-labelledby="topics-title" className="py-20 md:py-32">
            <div className="mb-10 grid grid-cols-4 gap-x-6 gap-y-6 px-6 md:mb-14 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 self-end text-display font-medium md:col-span-7">
                <span id="topics-title">Topics</span>
              </Reveal>
              <Reveal as="p" className="col-span-4 max-w-md self-end text-lead text-ink-300 md:col-span-4 md:col-start-9">
                The subjects we program around, year after year. Every Flagship draws its talks from across them.
              </Reveal>
            </div>
            <TopicMarquee topics={topics} />
          </section>
        )}

        {/* Every Flagship so far, a row each: proof, just before the ask. */}
        {pastEditions.length > 0 && (
          <section id="editions" aria-labelledby="editions-title" className="scroll-mt-16 px-6 py-20 md:py-32">
            <div className="mb-10 grid grid-cols-4 gap-x-6 gap-y-6 md:mb-14 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 self-end text-display font-medium md:col-span-8">
                <span id="editions-title">Over the years</span>
              </Reveal>
              <Reveal as="p" className="col-span-4 max-w-md self-end text-lead text-ink-300 md:col-span-4 md:col-start-9">
                Every Flagship so far, and who spoke.
              </Reveal>
            </div>
            <EditionList editions={pastEditions.map(toRow)} />
          </section>
        )}

        {/* Tickets: the one ask on the page, and its close. */}
        {edition && (
          <section aria-labelledby="tickets-title" className="px-6 py-20 md:py-32">
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 text-display font-medium md:col-span-6">
                <span id="tickets-title">Tickets</span>
              </Reveal>
              <div className="col-span-4 flex flex-col items-start gap-8 md:col-span-5 md:col-start-8 md:pt-6">
                {copy && copy.included.length > 0 ? (
                  <Reveal as="ul" className="w-full border-t border-rule">
                    {copy.included.map((item) => (
                      <li key={item} className="border-b border-rule py-5 text-lead">
                        {item}
                      </li>
                    ))}
                  </Reveal>
                ) : (
                  <Reveal as="p" className="max-w-md text-lead text-ink-300">
                    {`Tickets for ${title} are not on sale yet. Join the early-access list to hear first.`}
                  </Reveal>
                )}
                <Reveal className="flex flex-wrap gap-2">
                  {joinHref && (
                    <SquareLink href={joinHref}>
                      {joinLabel}
                    </SquareLink>
                  )}
                  <SquareLink href="/faq" variant="secondary">
                    Questions
                  </SquareLink>
                </Reveal>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
