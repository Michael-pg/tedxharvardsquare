import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { PartnerLogos } from "@/components/home/partner-logos";
import { Section } from "@/components/flagship/section";
import { SquareLink } from "@/components/ui/square-link";
import { getMenuImages, getPartners, getSiteSettings, getSponsorPage } from "@/content";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "Partner with TEDxHarvardSquare: support an independently organized TEDx event and the community of founders, researchers, creators and leaders around it.",
};

/**
 * Sponsor: the pitch, from Studio → Sponsor page. Also the dedicated page the
 * TEDx licence requires for partner logos, which may not appear on the
 * homepage; logos stay smaller than the event's own (see `PartnerLogos`).
 *
 * Black opening, a wide photo, the pitch on paper, then current partners and
 * the ask back on black.
 */
export default async function SponsorPage() {
  const [site, page, partners, menuImages] = await Promise.all([
    getSiteSettings(),
    getSponsorPage(),
    getPartners(),
    getMenuImages(),
  ]);
  const logoPartners = partners.filter((partner) => partner.logoOnDark ?? partner.logo);
  const photo = page?.photo ?? menuImages.sponsor;
  const [lead, ...rest] = page?.body ?? [];
  const mailto = `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Sponsoring ${site.name}`)}`;

  return (
    <>
      <SiteNav />
      <main>
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

        {lead && (
          <Section tone="paper" className="mt-24 px-6 py-24 md:mt-40 md:py-40">
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
              <Reveal as="p" className="col-span-4 text-title font-medium text-balance md:col-span-7">
                {lead}
              </Reveal>
              {rest.length > 0 && (
                <div className="col-span-4 flex flex-col gap-4 md:col-span-4 md:col-start-9 md:pt-2">
                  {rest.map((paragraph, i) => (
                    <Reveal key={i} as="p" className="text-lead text-ink-600">
                      {paragraph}
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {logoPartners.length > 0 && (
          <section aria-label="Current partners" className="px-6 pt-24 md:pt-40">
            <Reveal>
              <PartnerLogos lead="With thanks to our partners" partners={logoPartners} />
            </Reveal>
          </section>
        )}

        {/* The ask. Partners never shape the program; the TEDx licence says so. */}
        <section aria-labelledby="sponsor-ask" className="flex flex-col items-center px-6 py-24 text-center md:py-40">
          <Reveal as="h2" className="max-w-4xl text-display font-medium text-balance">
            <span id="sponsor-ask">{page?.ask ?? `Interested in partnering with ${site.name}?`}</span>
          </Reveal>
          <Reveal className="mt-12 flex flex-col items-center gap-5">
            <SquareLink href={mailto}>{page?.ctaLabel ?? "Become a sponsor"}</SquareLink>
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
