import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home/dot-field";
import { Motto } from "@/components/home/motto";
import { FlagshipHero } from "@/components/flagship/flagship-hero";
import { LineupPlaceholder } from "@/components/flagship/lineup-placeholder";
import { PhotoCollage } from "@/components/flagship/photo-collage";
import { Section } from "@/components/flagship/section";
import { SpeakerNames } from "@/components/flagship/speaker-names";
import { TopicMarquee } from "@/components/flagship/topic-marquee";
import { Venue } from "@/components/flagship/venue";
import { SquareLink } from "@/components/ui/square-link";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCurrentEdition,
  getHomePage,
  getSiteSettings,
  getSpeakerArchive,
  getSpeakers,
  getTopics,
  type Image as ImageContent,
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

/** The three questions step across the grid, so the list reads as a sequence. */
const questionStart = ["md:col-start-1", "md:col-start-4", "md:col-start-7"];

/** Drops repeats of the same photo, keeping the first. */
const unique = (images: (ImageContent | undefined)[]) =>
  images.filter((image, i, all): image is ImageContent =>
    Boolean(image?.src) && all.findIndex((other) => other?.src === image?.src) === i,
  );

/**
 * Flagship: the annual conference, led by the current edition. Six beats, each
 * with one idea: the poster (theme, date, venue), the statement and a
 * collage of past editions, the lineup, the venue, the topics, and tickets.
 * Everything comes from the edition in Studio; any part left empty is simply
 * not shown, and the collage borrows the home page's photos until the edition
 * has its own.
 *
 * The dot field runs behind the poster and the statement only, and stops at
 * the collage, so the photographs and everything after sit on plain black.
 */
export default async function FlagshipPage() {
  const [site, edition, archive, home, topics] = await Promise.all([
    getSiteSettings(),
    getCurrentEdition(),
    getSpeakerArchive(),
    getHomePage(),
    getTopics(),
  ]);
  const lineup = edition ? (await getSpeakers(edition.slug)).filter((s) => s.kind === "speaker") : [];

  const title = edition ? `TEDxHarvardSquare ${edition.year}` : "TEDxHarvardSquare";
  const copy = edition?.page;
  const date = edition?.date ? new Date(edition.date) : undefined;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  // Tickets once they are on sale; until then, the early-access list.
  const joinHref = edition?.ticketUrl ?? site.earlyAccessUrl ?? site.newsletterUrl;
  const joinLabel = edition?.ticketUrl ? "Get tickets" : "Get early access";

  const photos = copy?.photos.length
    ? copy.photos
    : unique([
        home.flagshipPhoto,
        ...home.heroImages,
        ...archive.map((speaker) => speaker.talk?.still),
      ]);
  // Past speakers' portraits, printed past recognition, stand in for the lineup.
  const placeholders = archive.flatMap((s) => (s.headshot?.src ? [s.headshot] : [])).slice(0, 4);
  const eventJsonLd = edition && editionJsonLd(site, edition, copy?.heroImage ?? photos[0]);

  return (
    <>
      {eventJsonLd && <JsonLd data={eventJsonLd} />}
      <SiteNav />
      <DotField strength={0.8} />

      <main className="relative">
        <FlagshipHero
          theme={edition?.theme ?? "Flagship"}
          pitch={edition?.themeStatement}
          when={date ? longDate.format(date) : copy?.month}
          venue={venueKnown ? edition?.venue?.name : undefined}
          city={edition?.venue ? `${edition.venue.city}, ${edition.venue.state}` : copy?.place}
          edition={edition ? `Edition ${edition.number}` : undefined}
          action={joinHref ? { label: joinLabel, href: joinHref } : undefined}
        />

        {/* The theme, lit line by line, with its invitation and questions. */}
        {copy && (copy.statement.length > 0 || copy.invitation || copy.questions.length > 0) && (
          <section aria-label="The theme" className="px-6 py-24 md:py-40">
            {copy.statement.length > 0 && <Motto lines={copy.statement} />}
            {copy.invitation && (
              <Reveal
                as="p"
                className={`max-w-3xl text-lead text-ink-300 ${copy.statement.length > 0 ? "mt-16 md:mt-24" : ""}`}
              >
                <span data-dot-clear>{copy.invitation}</span>
              </Reveal>
            )}
            {copy.questions.length > 0 && (
              <ul className="mt-20 grid grid-cols-4 gap-y-8 md:mt-32 md:grid-cols-12 md:gap-y-12">
                {copy.questions.slice(0, questionStart.length).map((question, i) => (
                  <Reveal
                    key={question}
                    as="li"
                    delay={i * 0.1}
                    className={`col-span-4 text-title font-medium text-balance md:col-span-6 ${questionStart[i]}`}
                  >
                    <span data-dot-clear>{question}</span>
                  </Reveal>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Past editions in pictures; the dot field stops here. */}
        {photos.length > 0 && (
          <section data-dot-stop aria-label="Photographs from past editions" className="relative bg-background px-6 py-24 md:py-40">
            <PhotoCollage images={photos} />
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
          <section aria-labelledby="topics-title" className="py-24 md:py-40">
            <div className="mb-12 grid grid-cols-4 gap-x-6 gap-y-6 px-6 md:mb-20 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 text-mega font-medium md:col-span-7">
                <span id="topics-title">Topics</span>
              </Reveal>
              <Reveal as="p" className="col-span-4 max-w-md self-end text-lead text-ink-300 md:col-span-4 md:col-start-9">
                The subjects we program around, year after year. Every Flagship draws its talks from across them.
              </Reveal>
            </div>
            <TopicMarquee topics={topics} />
          </section>
        )}

        {/* Tickets: the one ask on the page, and its close. */}
        {edition && (
          <Section tone="paper" aria-labelledby="tickets-title" className="px-6 py-24 md:py-40">
            <div className="grid grid-cols-4 gap-x-6 gap-y-12 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 text-mega font-medium md:col-span-6">
                <span id="tickets-title">Tickets</span>
              </Reveal>
              <div className="col-span-4 flex flex-col items-start gap-8 md:col-span-5 md:col-start-8 md:pt-6">
                {copy && copy.included.length > 0 ? (
                  <Reveal as="ul" className="w-full border-t border-ink-200">
                    {copy.included.map((item) => (
                      <li key={item} className="border-b border-ink-200 py-5 text-lead">
                        {item}
                      </li>
                    ))}
                  </Reveal>
                ) : (
                  <Reveal as="p" className="max-w-md text-lead text-ink-600">
                    {`Tickets for ${title} are not on sale yet. Join the early-access list to hear first.`}
                  </Reveal>
                )}
                <Reveal className="flex flex-wrap gap-2">
                  {joinHref && (
                    <SquareLink href={joinHref} tone="light">
                      {joinLabel}
                    </SquareLink>
                  )}
                  <SquareLink href="/faq" variant="secondary" tone="light">
                    Questions
                  </SquareLink>
                </Reveal>
              </div>
            </div>
          </Section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
