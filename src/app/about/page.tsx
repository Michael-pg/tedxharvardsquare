import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { SquareLink } from "@/components/ui/square-link";
import { getSiteSettings } from "@/content";
import { TEDX_PROGRAM_URL, TED_PROGRAMS_URL, aboutTed, aboutTedx } from "@/content/tedx";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "About",
    description:
      "TEDxHarvardSquare is an independently organized TEDx event in Cambridge, Massachusetts: an annual Flagship conference and House, our year-round programming.",
    path: "/about",
  });
}

/**
 * About: who we are, then the "About TEDx" and "About TED" sections the TEDx
 * licence requires on every event's About page, word for word (`@/content/tedx`).
 */
export default async function AboutPage() {
  const site = await getSiteSettings();

  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            About
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 max-w-3xl text-lead text-ink-300">
            {site.missionStatement}
          </SplitReveal>
          <Reveal as="p" delay={0.3} className="mt-6 max-w-3xl text-body text-muted">
            {`${site.name} runs an annual Flagship conference in Cambridge, Massachusetts, and House, our year-round programming between editions. It is independently organized under license from TED.`}
          </Reveal>
        </header>

        <div className="flex max-w-5xl flex-col gap-20 md:gap-28">
          <section
            aria-labelledby="about-tedx"
            className="grid grid-cols-4 gap-x-6 gap-y-6 border-t border-rule pt-10 md:grid-cols-12"
          >
            <Reveal as="h2" className="col-span-4 text-title font-medium md:col-span-4">
              <span id="about-tedx">About TEDx</span>
            </Reveal>
            <Reveal className="col-span-4 flex flex-col items-start gap-8 md:col-span-8">
              <p className="max-w-3xl text-body text-ink-200">{aboutTedx}</p>
              <SquareLink href={TEDX_PROGRAM_URL} variant="secondary">
                About the TEDx program
              </SquareLink>
            </Reveal>
          </section>

          <section
            aria-labelledby="about-ted"
            className="grid grid-cols-4 gap-x-6 gap-y-6 border-t border-rule pt-10 md:grid-cols-12"
          >
            <Reveal as="h2" className="col-span-4 text-title font-medium md:col-span-4">
              <span id="about-ted">About TED</span>
            </Reveal>
            <Reveal className="col-span-4 flex flex-col items-start gap-4 md:col-span-8">
              {aboutTed.map((paragraph, i) => (
                <p key={i} className="max-w-3xl text-body text-ink-200">
                  {paragraph}
                </p>
              ))}
              <div className="mt-4">
                <SquareLink href={TED_PROGRAMS_URL} variant="secondary">
                  TED&apos;s programs and initiatives
                </SquareLink>
              </div>
            </Reveal>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
