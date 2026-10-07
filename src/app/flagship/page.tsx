import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home/dot-field";
import { Motto } from "@/components/home/motto";
import { FlagshipPhoto } from "@/components/home/flagship-photo";
import { FlagshipHero } from "@/components/flagship/flagship-hero";
import { Reasons } from "@/components/flagship/reasons";
import { Section } from "@/components/flagship/section";
import { SpeakersPreview } from "@/components/flagship/speakers-preview";
import { Venue } from "@/components/flagship/venue";
import { SquareLink } from "@/components/ui/square-link";
import {
  getCurrentEdition,
  getEditions,
  getHomePage,
  getSiteSettings,
  getSpeakerArchive,
  getSpeakers,
  type Image as ImageContent,
} from "@/content";

export async function generateMetadata(): Promise<Metadata> {
  const edition = await getCurrentEdition();
  return {
    title: "Flagship",
    description: edition?.theme
      ? `TEDxHarvardSquare ${edition.year}: ${edition.theme}. A day of talks, Discovery Sessions and conversations in Cambridge, Massachusetts.`
      : "TEDxHarvardSquare's annual conference in Cambridge, Massachusetts: a day of talks, Discovery Sessions and conversations.",
  };
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/** The three questions step across the grid, so the list reads as a sequence. */
const questionStart = ["md:col-start-1", "md:col-start-4", "md:col-start-7"];

/** An image field left empty in Studio projects with no `src`. */
const filled = (image?: ImageContent | null) => (image?.src ? image : undefined);

/**
 * Flagship: the annual conference, led by the current edition. Everything
 * comes from that edition in Studio: the facts from its Details tab, the copy
 * and photos from its Flagship page tab, and any part left empty is simply not
 * shown (photos fall back to the home page's).
 *
 * Calmer than home: it opens on a photograph rather than type, and alternates
 * black with light paper sections for the practical parts. The dot field is
 * the home page's, faded back, and shows only through the black sections.
 */
export default async function FlagshipPage() {
  const [site, edition, editions, archive, home] = await Promise.all([
    getSiteSettings(),
    getCurrentEdition(),
    getEditions(),
    getSpeakerArchive(),
    getHomePage(),
  ]);
  const lineup = edition ? (await getSpeakers(edition.slug)).filter((s) => s.kind === "speaker") : [];

  const title = edition ? `TEDxHarvardSquare ${edition.year}` : "TEDxHarvardSquare";
  const copy = edition?.page;
  const when = edition?.date ? dateFormat.format(new Date(edition.date)) : copy?.month;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  // Tickets once they are on sale; until then, the early-access list.
  const joinHref = edition?.ticketUrl ?? site.earlyAccessUrl ?? site.newsletterUrl;
  const joinLabel = edition?.ticketUrl ? "Get tickets" : "Get early access";
  const hasTheme = Boolean(copy && (copy.statement.length || copy.invitation || copy.questions.length));
  const pastEditions = editions.filter((e) => e.slug !== edition?.slug && e.status === "past");
  const talksIn = (year: number) => archive.filter((s) => s.editionYear === year && s.talk).length;

  const hero = home.heroImages;
  const heroImage = filled(copy?.heroImage) ?? hero[0];
  const audienceImage = filled(copy?.audienceImage) ?? hero[5];
  const venueImage = filled(copy?.venueImage) ?? hero[3];
  const programPhoto = home.flagshipPhoto ?? hero[1];
  const reasonFallbacks = [hero[2], hero[4], hero[1]].filter(Boolean);
  // Past speakers' portraits, printed past recognition, stand in for the lineup.
  const placeholders = archive.flatMap((s) => (s.headshot?.src ? [s.headshot] : [])).slice(0, 4);

  return (
    <>
      <SiteNav />
      <DotField strength={0.55} />

      <main className="relative">
        <FlagshipHero
          image={heroImage}
          kicker={title}
          theme={edition?.theme ?? "Flagship"}
          statement={edition?.themeStatement}
          facts={[copy?.place, when, venueKnown ? edition?.venue?.name : undefined].filter(Boolean).join(" · ")}
          action={joinHref ? { label: joinLabel, href: joinHref } : undefined}
        />

        {/* The theme: lit line by line, then the invitation and its questions. */}
        {copy && hasTheme && (
          <Section aria-label="The theme" className="px-6 py-24 md:py-40">
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
          </Section>
        )}

        {/* Why attend, and who comes: the first paper section. */}
        {copy && (copy.reasons.length > 0 || copy.audience) && (
          <Section tone="paper" className="px-6 py-24 md:py-40">
            {copy.reasons.length > 0 && (
              <div className="grid grid-cols-4 gap-x-6 gap-y-12 md:grid-cols-12">
                <div className="col-span-4 md:col-span-4">
                  <Reveal as="h2" className="text-display font-medium md:sticky md:top-32">
                    Why attend
                  </Reveal>
                </div>
                <div className="col-span-4 md:col-span-7 md:col-start-6">
                  <Reasons reasons={copy.reasons} fallbacks={reasonFallbacks} />
                </div>
              </div>
            )}
            {copy.audience && (
              <div className={copy.reasons.length > 0 ? "mt-32 md:mt-48" : ""}>
                <Reveal as="h2" className="mb-8 text-title font-medium text-ink-600">
                  Who&apos;s in the room
                </Reveal>
                <Reveal as="p" className="max-w-6xl text-display font-medium text-balance">
                  {copy.audience}
                </Reveal>
                {copy.audienceStats.length > 0 && (
                  <Reveal as="dl" className="mt-12 flex flex-wrap gap-x-16 gap-y-8">
                    {copy.audienceStats.map((stat) => (
                      <div key={stat.label} className="flex flex-col-reverse gap-1">
                        <dt className="text-body text-ink-600">{stat.label}</dt>
                        <dd className="text-display font-medium">{stat.value}</dd>
                      </div>
                    ))}
                  </Reveal>
                )}
                {audienceImage && (
                  <Reveal className="relative mt-16 aspect-4/3 overflow-hidden bg-ink-200 md:mt-24 md:aspect-21/9">
                    <Image
                      src={audienceImage.src}
                      alt={audienceImage.alt}
                      fill
                      sizes="100vw"
                      style={{
                        objectPosition: `${(audienceImage.focus?.x ?? 0.5) * 100}% ${(audienceImage.focus?.y ?? 0.5) * 100}%`,
                      }}
                      className="object-cover grayscale"
                    />
                  </Reveal>
                )}
              </div>
            )}
          </Section>
        )}

        {/* The program: copy left, a speaker on stage right. The photo's red plate
            drifts right, past the page edge, so the section clips it. */}
        {copy?.programTitle && (
          <Section className="grid grid-cols-4 items-center gap-x-6 gap-y-12 overflow-x-clip px-6 py-24 md:grid-cols-12 md:py-40">
            <div data-dot-clear className="col-span-4 flex flex-col items-start gap-6 md:col-span-5">
              <Reveal as="h2" className="text-display font-medium text-balance">
                {copy.programTitle}
              </Reveal>
              {copy.programBody.map((paragraph, i) => (
                <Reveal
                  key={i}
                  as="p"
                  className={`max-w-md text-lead text-balance ${i === 0 ? "text-ink-200" : "text-muted"}`}
                >
                  {paragraph}
                </Reveal>
              ))}
              <Reveal className="mt-4 flex flex-col items-start gap-4">
                {copy.programUrl ? (
                  <SquareLink href={copy.programUrl} variant="secondary">
                    Explore the program
                  </SquareLink>
                ) : (
                  <p className="text-small text-muted">Program to be announced.</p>
                )}
              </Reveal>
            </div>
            {programPhoto && (
              <FlagshipPhoto image={programPhoto} className="col-span-4 w-full md:col-span-6 md:col-start-7" />
            )}
          </Section>
        )}

        {/* This year's speakers, or the shape of a lineup until they're announced. */}
        {edition && (
          <Section aria-labelledby="speakers-title" className="px-6 pt-12 pb-24 md:pb-40">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-6 md:mb-16">
              <div data-dot-clear className="flex flex-col gap-4">
                <Reveal as="h2" className="text-display font-medium">
                  <span id="speakers-title">{`Speakers ${edition.year}`}</span>
                </Reveal>
                {lineup.length === 0 && (
                  <Reveal as="p" className="text-lead text-muted">
                    {copy?.speakersNote ?? "Lineup coming soon."}
                  </Reveal>
                )}
              </div>
              {lineup.length === 0 && (
                <Reveal>
                  <div data-dot-clear className="flex flex-wrap gap-2">
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
              )}
            </div>
            <Reveal>
              <SpeakersPreview speakers={lineup} placeholders={placeholders} />
            </Reveal>
          </Section>
        )}

        {/* What a ticket includes, once decided. */}
        {edition && (
          <Section tone="paper" aria-labelledby="included-title" className="px-6 py-24 md:py-40">
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 text-display font-medium md:col-span-5">
                <span id="included-title">What&apos;s included</span>
              </Reveal>
              <div className="col-span-4 md:col-span-6 md:col-start-7">
                {copy && copy.included.length > 0 ? (
                  <Reveal as="ul" className="border-t border-ink-200">
                    {copy.included.map((item) => (
                      <li key={item} className="border-b border-ink-200 py-5 text-lead">
                        {item}
                      </li>
                    ))}
                  </Reveal>
                ) : (
                  <Reveal className="flex flex-col items-start gap-8">
                    <p className="max-w-md text-lead text-ink-600">
                      Ticket details are on their way. Join the early-access list to hear first.
                    </p>
                    {joinHref && (
                      <SquareLink href={joinHref} tone="light">
                        {joinLabel}
                      </SquareLink>
                    )}
                  </Reveal>
                )}
              </div>
            </div>
          </Section>
        )}

        {edition?.venue && venueKnown && (
          <Venue venue={edition.venue} image={venueImage} when={when} notes={copy?.venueNotes ?? []} />
        )}

        {/* Now what: the close, centred, and the one ask on the page. */}
        <Section className="flex flex-col items-center px-6 py-24 text-center md:py-40">
          <Reveal as="h2" className="text-statement font-medium">
            <span data-dot-clear>{copy?.closeTitle ?? title}</span>
          </Reveal>
          {copy && copy.closeBody.length > 0 && (
            <div data-dot-clear className="mt-10 flex max-w-2xl flex-col gap-4 md:mt-14">
              {copy.closeBody.map((paragraph, i) => (
                <Reveal key={i} as="p" className={`text-lead text-balance ${i === 0 ? "text-ink-200" : "text-muted"}`}>
                  {paragraph}
                </Reveal>
              ))}
            </div>
          )}
          <Reveal className="mt-12 flex flex-col items-center gap-4">
            <div data-dot-clear className="flex flex-wrap justify-center gap-2">
              {joinHref && <SquareLink href={joinHref}>{`Join ${title}`}</SquareLink>}
              <SquareLink href="/faq" variant="secondary">
                Questions
              </SquareLink>
            </div>
            {!edition?.ticketUrl && joinHref && (
              <p data-dot-clear className="text-small text-muted">
                Tickets are not on sale yet. Join the list to hear first.
              </p>
            )}
          </Reveal>
        </Section>

        {/* Past editions: the record, each pointing to its talks. */}
        {pastEditions.length > 0 && (
          <Section aria-label="Past editions" className="px-6 pt-12 pb-24 md:pb-40">
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 text-title font-medium md:col-span-4">
                <span data-dot-clear>Past editions</span>
              </Reveal>
              <Reveal as="ul" className="col-span-4 border-t border-rule md:col-span-7 md:col-start-6">
                {pastEditions.map((past) => {
                  const talks = talksIn(past.year);
                  const meta = [past.venue?.name, talks ? `${talks} talks` : undefined].filter(Boolean).join(" · ");
                  return (
                    <li key={past.slug} data-dot-clear className="border-b border-rule">
                      <Link href="/speakers" className="group flex items-baseline gap-5 py-6">
                        <span className="w-20 shrink-0 text-heading font-medium md:w-32">{past.year}</span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-heading font-medium">
                            {past.theme ? `Edition ${past.number}: ${past.theme}` : `Edition ${past.number}`}
                          </span>
                          {meta && <span className="text-small text-muted">{meta}</span>}
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0 self-center text-muted transition-[color,transform] duration-fast ease-out-quart group-hover:translate-x-0.5 group-hover:text-foreground"
                        />
                      </Link>
                    </li>
                  );
                })}
              </Reveal>
            </div>
          </Section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
