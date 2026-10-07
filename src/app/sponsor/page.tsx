import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { PartnerLogos } from "@/components/home/partner-logos";
import { SquareLink } from "@/components/ui/square-link";
import { getPartners, getSiteSettings } from "@/content";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "The partners who make TEDxHarvardSquare possible, and how to support an independently organized TEDx event in Cambridge.",
};

/**
 * Partners: the dedicated page the TEDx licence requires for sponsor logos,
 * which may not appear on the homepage. Logos stay smaller than the event's
 * own (see `PartnerLogos`), and no partner is described as presenting the
 * event. The full sponsor pitch (audience, packages) comes later.
 */
export default async function SponsorPage() {
  const [site, partners] = await Promise.all([getSiteSettings(), getPartners()]);
  const logoPartners = partners.filter((partner) => partner.logoOnDark ?? partner.logo);

  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            Partners
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 max-w-3xl text-lead text-ink-300">
            {`${site.name} is independently organized and runs on the support of its partners. Partners help make the day possible; they have no say in who speaks or what is said.`}
          </SplitReveal>
        </header>

        {logoPartners.length > 0 && (
          <section aria-label="Current partners" className="border-t border-rule py-20 md:py-28">
            <Reveal>
              <PartnerLogos lead="With thanks to our partners" partners={logoPartners} />
            </Reveal>
          </section>
        )}

        <section aria-labelledby="partner-with-us" className="max-w-3xl border-t border-rule pt-10">
          <Reveal as="h2" className="text-title font-medium">
            <span id="partner-with-us">Partner with us</span>
          </Reveal>
          <Reveal as="p" className="mt-6 text-body text-ink-300">
            Interested in supporting the next edition or our year-round programming? Write to us and we&apos;ll share
            what partnership looks like.
          </Reveal>
          <Reveal className="mt-8">
            <SquareLink
              href={`mailto:${site.contactEmail}?subject=Partnering%20with%20${encodeURIComponent(site.name)}`}
            >
              Get in touch
            </SquareLink>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
