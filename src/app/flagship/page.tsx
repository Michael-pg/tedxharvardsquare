import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { DotField } from "@/components/home/dot-field";
import { FitHeadline } from "@/components/home/fit-headline";
import { Motto } from "@/components/home/motto";
import { FlagshipPhoto } from "@/components/home/flagship-photo";
import { PartnerLogos } from "@/components/home/partner-logos";
import { SquareLink } from "@/components/ui/square-link";
import {
  getCurrentEdition,
  getEditions,
  getHomePage,
  getPartners,
  getSiteSettings,
  getSpeakerArchive,
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

const pad = (n: number) => String(n).padStart(2, "0");
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/** The three questions step across the grid, so the list reads as a sequence. */
const questionStart = ["md:col-start-1", "md:col-start-4", "md:col-start-7"];

/**
 * Flagship: the annual conference, led by the current edition. Everything
 * comes from that edition in Studio: the facts from its Details tab, the copy
 * from its Flagship page tab, and any part left empty is simply not shown.
 * The page shares the home page's dot field, which draws the edition number.
 */
export default async function FlagshipPage() {
  const [site, edition, editions, archive, home, partners] = await Promise.all([
    getSiteSettings(),
    getCurrentEdition(),
    getEditions(),
    getSpeakerArchive(),
    getHomePage(),
    getPartners(),
  ]);

  const title = edition ? `TEDxHarvardSquare ${edition.year}` : "TEDxHarvardSquare";
  const copy = edition?.page;
  const when = edition?.date ? dateFormat.format(new Date(edition.date)) : copy?.month;
  const venueKnown = edition?.venue && edition.venue.name !== "Venue TBA";
  // Tickets once they are on sale; until then, the early-access list.
  const joinHref = edition?.ticketUrl ?? site.earlyAccessUrl ?? site.newsletterUrl;
  const hasTheme = Boolean(copy && (copy.statement.length || copy.invitation || copy.questions.length));
  const pastEditions = editions.filter((e) => e.slug !== edition?.slug && e.status === "past");
  const talksIn = (year: number) => archive.filter((s) => s.editionYear === year && s.talk).length;
  const photo = home.flagshipPhoto ?? home.heroImages[1];
  const logoPartners = partners.filter((partner) => partner.logoOnDark ?? partner.logo);

  return (
    <>
      <SiteNav />
      <DotField />

      <main className="relative">
        {/* Hero: the theme across the top, the dot field in the lower right. */}
        <section className="flex min-h-svh flex-col px-6 pt-24 pb-7 md:pt-28">
          <p data-dot-clear className="mb-4 text-heading font-medium text-ink-300 md:mb-2">
            {title}
          </p>
          <div>
            <FitHeadline>{edition?.theme ?? "Flagship"}</FitHeadline>
          </div>
          {edition?.themeStatement && (
            <p data-dot-clear className="mt-8 max-w-md text-heading font-medium text-balance md:mt-10">
              {edition.themeStatement}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-16">
            <div data-dot-clear className="flex flex-wrap gap-2">
              {hasTheme && (
                <SquareLink href="#theme">
                  {edition?.theme ? `Explore ${edition.theme}` : "Explore the theme"}
                </SquareLink>
              )}
            </div>
            <p data-dot-clear className="text-small text-muted">
              {[copy?.place, when].filter(Boolean).join(" · ")}
            </p>
          </div>
        </section>

        {/* The theme: lit line by line, then the invitation and its questions. */}
        {copy && hasTheme && (
          <section id="theme" aria-label="The theme" className="scroll-mt-24 px-6 py-24 md:py-40">
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

        {/* The facts, beside the edition number drawn in dots. */}
        {edition && (
          <section
            aria-label="When and where"
            className="grid grid-cols-4 items-center gap-x-6 gap-y-12 px-6 py-24 md:grid-cols-12 md:py-40"
          >
            <div className="col-span-4 md:col-span-5">
              <Reveal as="h2" className="mb-10 text-display font-medium">
                <span data-dot-clear>{`Flagship ${edition.year}`}</span>
              </Reveal>
              <Reveal as="dl" className="border-t border-rule">
                {[
                  ["Edition", `Edition ${edition.number}`],
                  ["When", edition.date ? when : when ? `${when}, date to be announced` : "Date to be announced"],
                  [
                    "Where",
                    venueKnown
                      ? [edition.venue?.name, edition.venue?.addressLine, edition.venue?.city]
                          .filter(Boolean)
                          .join(", ")
                      : `${edition.venue?.city ?? "Cambridge"}, venue to be announced`,
                  ],
                ].map(([term, detail]) => (
                  <div key={term} data-dot-clear className="flex gap-6 border-b border-rule py-5">
                    <dt className="w-24 shrink-0 text-body text-muted">{term}</dt>
                    <dd className="text-body text-foreground">{detail}</dd>
                  </div>
                ))}
              </Reveal>
            </div>
            {/* Drawn by the dot field; the text itself is never painted. */}
            <p
              aria-hidden="true"
              data-dot-glyph
              className="col-span-4 self-center justify-self-end text-numeral font-medium text-transparent select-none md:col-span-6 md:col-start-7"
            >
              {pad(edition.number)}
            </p>
          </section>
        )}

        {/* The program: copy left, a speaker on stage right. The photo's red plate
            drifts right, past the page edge, so the section clips it. */}
        {copy?.programTitle && (
          <section className="grid overflow-x-clip grid-cols-4 items-center gap-x-6 gap-y-12 px-6 py-24 md:grid-cols-12 md:py-40">
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
                  <>
                    <p className="text-small text-muted">Program to be announced.</p>
                    <SquareLink href="/speakers" variant="secondary">
                      Watch past talks
                    </SquareLink>
                  </>
                )}
              </Reveal>
            </div>
            {photo && <FlagshipPhoto image={photo} className="col-span-4 w-full md:col-span-6 md:col-start-7" />}
          </section>
        )}

        {/* Now what: the close, centred, and the one ask on the page. */}
        <section className="flex flex-col items-center px-6 py-24 text-center md:py-40">
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
        </section>

        {/* Past editions: the record, each pointing to its talks. */}
        {pastEditions.length > 0 && (
          <section aria-label="Past editions" className="px-6 py-24 md:py-40">
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
          </section>
        )}

        {logoPartners.length > 0 && (
          <section aria-label="Partners" className="px-6 pt-12 pb-24 md:pt-24 md:pb-40">
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
