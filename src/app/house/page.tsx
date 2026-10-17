import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { HouseEvents } from "@/components/house/house-events";
import { HouseField } from "@/components/house/house-field";
import { SquareLink } from "@/components/ui/square-link";
import {
  getHomePage,
  getHouseCalendar,
  getPageCopy,
  getSiteSettings,
  type Image as ImageContent,
} from "@/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("housePage");
  return pageMetadata({ title: "House", description: copy.seoDescription, path: "/house" });
}

/** A photo at a fixed crop that keeps the Studio hotspot in frame. */
const Photo = ({ image, className, sizes }: { image: ImageContent; className: string; sizes: string }) => (
  <div className={`relative overflow-hidden bg-ink-900 ${className}`}>
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      style={{ objectPosition: `${(image.focus?.x ?? 0.5) * 100}% ${(image.focus?.y ?? 0.5) * 100}%` }}
      className="object-cover"
    />
  </div>
);

/**
 * House: the year-round programme, with the same standing as Flagship. Events
 * come from Studio → House event and RSVP on Luma. Until any are announced the
 * page says so plainly and points to the Luma calendar, where they go up first.
 *
 * The hero carries House's own pixel field (many small gatherings, where
 * Flagship's is one mass), then a photograph, what House is, the calendar, and
 * the follow ask. Photos are existing event photography: past House events first,
 * then the home page's audience frames. With none at all, those sections are simply absent.
 */
export default async function HousePage() {
  const [site, { upcoming, past }, copy, home] = await Promise.all([
    getSiteSettings(),
    getHouseCalendar(),
    getPageCopy("housePage"),
    getHomePage(),
  ]);

  // House event photography first, then the home page's
  // audience and room frames; never repeating a photo.
  const eventPhotos = [...past, ...upcoming].flatMap((event) => [event.coverImage, ...event.gallery]);
  const seen = new Set<string>();
  const unused = (image: ImageContent | undefined): image is ImageContent => {
    if (!image?.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  };
  const feature = [...eventPhotos, home.heroImages[5], ...home.heroImages].find(unused);
  const gallery = [...eventPhotos, home.heroImages[0], ...home.heroImages].filter(unused).slice(0, 3);

  const follow = [
    site.lumaUrl && { label: upcoming.length > 0 ? copy.calendarLabel : copy.followLabel, href: site.lumaUrl },
    site.newsletterUrl && { label: copy.subscribeLabel, href: site.newsletterUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <>
      <SiteNav />
      <main id="main">
        <header className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-40 pb-16 md:pb-24">
          <HouseField />
          <div data-house-clear className="relative max-w-4xl">
            <SplitReveal as="h1" by="chars" onScroll={false} className="text-hero font-medium">
              {copy.title}
            </SplitReveal>
            <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 max-w-3xl text-lead text-ink-300">
              {copy.intro}
            </SplitReveal>
          </div>
        </header>

        {feature && (
          <Reveal className="relative aspect-4/3 w-full overflow-hidden bg-ink-900 md:aspect-21/9">
            <Image
              src={feature.src}
              alt={feature.alt}
              fill
              sizes="100vw"
              style={{ objectPosition: `${(feature.focus?.x ?? 0.5) * 100}% ${(feature.focus?.y ?? 0.5) * 100}%` }}
              className="object-cover"
            />
          </Reveal>
        )}

        <section aria-label="What House is" className="px-6 py-24 md:py-40">
          <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12 md:gap-y-16">
            <Reveal as="h2" className="col-span-4 text-title font-medium text-balance md:col-span-7 md:row-start-1">
              {copy.whatHeading}
            </Reveal>
            <Reveal as="p" className="col-span-4 max-w-xl text-lead text-ink-300 md:col-span-5 md:row-start-2">
              {copy.whatBody}
            </Reveal>
            {gallery[0] && (
              <Reveal className="col-span-3 col-start-2 md:col-span-4 md:col-start-9 md:row-span-2 md:row-start-1">
                <Photo image={gallery[0]} className="aspect-4/5" sizes="(min-width: 768px) 33vw, 75vw" />
              </Reveal>
            )}
            {gallery[1] && (
              <Reveal className="col-span-4 md:col-span-6 md:col-start-2 md:row-start-3">
                <Photo image={gallery[1]} className="aspect-3/2" sizes="(min-width: 768px) 50vw, 100vw" />
              </Reveal>
            )}
            {gallery[2] && (
              <Reveal className="col-span-2 md:col-span-3 md:col-start-10 md:row-start-3 md:self-end">
                <Photo image={gallery[2]} className="aspect-square" sizes="(min-width: 768px) 25vw, 50vw" />
              </Reveal>
            )}
          </div>
        </section>

        <section aria-label="Upcoming House events" className="border-t border-rule px-6 py-24 md:py-40">
          <div className="max-w-5xl">
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
                <p className="mt-3 max-w-xl text-body text-muted">{copy.emptyBody}</p>
              </Reveal>
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section aria-label="Past House events" className="border-t border-rule px-6 py-24 md:py-40">
            <div className="max-w-5xl">
              <Reveal as="h2" className="mb-10 text-title font-medium">
                {copy.pastHeading}
              </Reveal>
              <Reveal>
                <HouseEvents events={past} past />
              </Reveal>
            </div>
          </section>
        )}

        {follow.length > 0 && (
          <section aria-label="Follow House" className="border-t border-rule px-6 py-24 md:py-40">
            <Reveal as="h2" className="max-w-4xl text-title font-medium text-balance">
              {copy.followHeading}
            </Reveal>
            <Reveal as="p" className="mt-6 max-w-xl text-body text-muted">
              {copy.followBody}
            </Reveal>
            <Reveal className="mt-10 flex flex-wrap gap-2">
              {follow.map((link, i) => (
                <SquareLink key={link.href} href={link.href} variant={i === 0 ? "primary" : "secondary"}>
                  {link.label}
                </SquareLink>
              ))}
            </Reveal>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
