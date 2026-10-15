import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { HouseEvents } from "@/components/house/house-events";
import { SquareLink } from "@/components/ui/square-link";
import { getHouseCalendar, getPageCopy, getSiteSettings } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("housePage");
  return pageMetadata({ title: "House", description: copy.seoDescription, path: "/house" });
}

/**
 * House: the year-round programme, with the same standing as Flagship. Events
 * come from Studio → House event and RSVP on Luma. Until any are announced the
 * page says so plainly and points to the Luma calendar, where they go up first.
 */
export default async function HousePage() {
  const [site, { upcoming, past }, copy] = await Promise.all([
    getSiteSettings(),
    getHouseCalendar(),
    getPageCopy("housePage"),
  ]);

  const follow = [
    site.lumaUrl && { label: upcoming.length > 0 ? copy.calendarLabel : copy.followLabel, href: site.lumaUrl },
    site.newsletterUrl && { label: copy.subscribeLabel, href: site.newsletterUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <>
      <SiteNav />
      <main id="main" className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            {copy.title}
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 max-w-3xl text-lead text-ink-300">
            {copy.intro}
          </SplitReveal>
        </header>

        <section aria-label="Upcoming House events" className="max-w-5xl">
          <Reveal as="h2" className="mb-10 text-title font-medium">
            {copy.upcomingHeading}
          </Reveal>
          {upcoming.length > 0 ? (
            <Reveal>
              <HouseEvents events={upcoming} />
            </Reveal>
          ) : (
            <Reveal className="border-t border-rule pt-10">
              <p className="text-heading font-medium">{copy.emptyHeading}</p>
              <p className="mt-3 max-w-xl text-body text-muted">
                {copy.emptyBody}
              </p>
            </Reveal>
          )}
          {follow.length > 0 && (
            <Reveal className="mt-10 flex flex-wrap gap-2">
              {follow.map((link, i) => (
                <SquareLink key={link.href} href={link.href} variant={i === 0 ? "primary" : "secondary"}>
                  {link.label}
                </SquareLink>
              ))}
            </Reveal>
          )}
        </section>

        {past.length > 0 && (
          <section aria-label="Past House events" className="mt-24 max-w-5xl md:mt-40">
            <Reveal as="h2" className="mb-10 text-title font-medium">
              {copy.pastHeading}
            </Reveal>
            <Reveal>
              <HouseEvents events={past} past />
            </Reveal>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
