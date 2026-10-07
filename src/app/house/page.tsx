import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { HouseEvents } from "@/components/house/house-events";
import { SquareLink } from "@/components/ui/square-link";
import { getHouseCalendar, getSiteSettings } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "House",
    description:
      "House is TEDxHarvardSquare's year-round programming in Cambridge: salons, founder dinners, AMAs and workshops between Flagship editions.",
    path: "/house",
  });
}

/**
 * House: the year-round programme, with the same standing as Flagship. Events
 * come from Studio → House event and RSVP on Luma. Until any are announced the
 * page says so plainly and points to the Luma calendar, where they go up first.
 */
export default async function HousePage() {
  const [site, { upcoming, past }] = await Promise.all([getSiteSettings(), getHouseCalendar()]);

  const follow = [
    site.lumaUrl && { label: upcoming.length > 0 ? "Full calendar on Luma" : "Follow on Luma", href: site.lumaUrl },
    site.newsletterUrl && { label: "Subscribe", href: site.newsletterUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            House
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 max-w-3xl text-lead text-ink-300">
            Our year-round programming. Salons, founder dinners, AMAs and workshops in Cambridge between
            Flagship editions, for a growing network of founders, scientists and leaders across Boston&apos;s
            innovation ecosystem.
          </SplitReveal>
        </header>

        <section aria-label="Upcoming House events" className="max-w-5xl">
          <Reveal as="h2" className="mb-10 text-title font-medium">
            Upcoming
          </Reveal>
          {upcoming.length > 0 ? (
            <Reveal>
              <HouseEvents events={upcoming} />
            </Reveal>
          ) : (
            <Reveal className="border-t border-rule pt-10">
              <p className="text-heading font-medium">More to be announced.</p>
              <p className="mt-3 max-w-xl text-body text-muted">
                New House events go up on our Luma calendar first. Follow it to hear when the next one opens.
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
              Past
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
