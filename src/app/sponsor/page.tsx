import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { PartnerWall } from "@/components/sponsor/partner-wall";
import { SquareLink } from "@/components/ui/square-link";
import { getHomePage, getMenuImages, getPageCopy, getPartners, getSiteSettings, getSponsorPage, type Image as ImageContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("sponsorPage");
  return pageMetadata({ title: "Sponsor", description: copy.seoDescription, path: "/sponsor" });
}

/**
 * Sponsor: the pitch, from Studio → Pages → Sponsor. Also the dedicated page the
 * TEDx licence requires for partner logos, which may not appear on the
 * homepage; logos stay smaller than the event's own (see `PartnerWall`).
 *
 * All on black: the headline, a wide photo, the pitch set beside two photos of
 * the room, current partners, then the ask.
 */
/** A photo of the room at a fixed crop, square to the grid. */
const Photo = ({ image, ratio, sizes }: { image: ImageContent; ratio: string; sizes: string }) => (
  <div className={`relative overflow-hidden bg-ink-900 ${ratio}`}>
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

export default async function SponsorPage() {
  const [site, page, copy, partners, menuImages, home] = await Promise.all([
    getSiteSettings(),
    getSponsorPage(),
    getPageCopy("sponsorPage"),
    getPartners(),
    getMenuImages(),
    getHomePage(),
  ]);
  const logoPartners = partners.filter((partner) => partner.logoOnDark ?? partner.logo);
  const photo = page?.photo ?? menuImages.sponsor;
  const [lead, ...rest] = page?.body ?? [];
  // Until Studio has pitch photos, the home hero's audience and raised-hands
  // frames stand in: the room a partner is reaching.
  const pitchPhotos = (page?.photos.length ? page.photos : [home.heroImages[5], home.heroImages[0]])
    .filter((image): image is ImageContent => Boolean(image?.src) && image?.src !== photo?.src)
    .slice(0, 2);
  const mailto = `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Sponsoring ${site.name}`)}`;

  return (
    <>
      <SiteNav />
      <main id="main">
        <header className="px-6 pt-40 pb-16 md:pt-56 md:pb-24">
          <SplitReveal as="h1" by="words" onScroll={false} className="max-w-5xl text-display font-medium text-balance">
            {page?.headline ?? "Sponsor"}
          </SplitReveal>
        </header>

        {photo && (
          <Reveal className="relative mx-6 aspect-4/3 overflow-hidden bg-ink-900 md:aspect-21/9">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: `${(photo.focus?.x ?? 0.5) * 100}% ${(photo.focus?.y ?? 0.5) * 100}%` }}
              className="object-cover grayscale"
            />
          </Reveal>
        )}

        {/* The pitch, each paragraph beside a photo of the room. */}
        {lead && (
          <section aria-label="Why partner with us" className="px-6 py-24 md:py-40">
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12 md:gap-y-16">
              <Reveal as="p" className="col-span-4 text-title font-medium text-balance md:col-span-7 md:row-start-1">
                {lead}
              </Reveal>
              {pitchPhotos[0] && (
                <Reveal className="col-span-3 col-start-2 md:col-span-4 md:col-start-9 md:row-start-1">
                  <Photo image={pitchPhotos[0]} ratio="aspect-4/5" sizes="(min-width: 768px) 33vw, 75vw" />
                </Reveal>
              )}
              {rest.length > 0 && (
                <div className="col-span-4 flex flex-col gap-4 self-end md:col-span-4 md:col-start-8 md:row-start-2">
                  {rest.map((paragraph, i) => (
                    <Reveal key={i} as="p" className="text-lead text-ink-300">
                      {paragraph}
                    </Reveal>
                  ))}
                </div>
              )}
              {pitchPhotos[1] && (
                <Reveal className="col-span-4 md:col-span-6 md:col-start-1 md:row-start-2">
                  <Photo image={pitchPhotos[1]} ratio="aspect-3/2" sizes="(min-width: 768px) 50vw, 100vw" />
                </Reveal>
              )}
            </div>
          </section>
        )}

        {logoPartners.length > 0 && (
          <section aria-labelledby="partners-title" className="px-6 pb-24 md:pb-40">
            <div className="mb-10 grid grid-cols-4 gap-x-6 gap-y-6 md:mb-14 md:grid-cols-12">
              <Reveal as="h2" className="col-span-4 self-end text-display font-medium md:col-span-8">
                <span id="partners-title">{copy.partnersHeading}</span>
              </Reveal>
              <Reveal as="p" className="col-span-4 max-w-md self-end text-lead text-ink-300 md:col-span-4 md:col-start-9">
                {copy.partnersIntro}
              </Reveal>
            </div>
            <Reveal>
              <PartnerWall partners={logoPartners} />
            </Reveal>
          </section>
        )}

        {/* The ask. Partners never shape the program; the TEDx licence says so. */}
        <section aria-labelledby="sponsor-ask" className="flex flex-col items-center px-6 py-24 text-center md:py-40">
          <Reveal as="h2" className="max-w-4xl text-display font-medium text-balance wrap-anywhere">
            <span id="sponsor-ask">{copy.ask}</span>
          </Reveal>
          <Reveal className="mt-12 flex flex-col items-center gap-5">
            <SquareLink href={mailto}>{copy.ctaLabel}</SquareLink>
            <a
              href={mailto}
              className="text-body text-ink-300 underline decoration-ink-600 underline-offset-4 transition-colors duration-fast hover:text-foreground hover:decoration-brand"
            >
              {site.contactEmail}
            </a>
            <p className="mt-6 max-w-md text-small text-muted">
              Partners help make the event possible. As with every TEDx event, they have no say in who speaks or what is
              said.
            </p>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
