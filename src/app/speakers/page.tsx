import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { SpeakerArchive } from "@/components/speakers/speaker-archive";
import { getSpeakerArchive, type SpeakerWithTalk } from "@/content";

export const metadata: Metadata = {
  title: "Speakers",
  description:
    "Meet the innovators, scientists, founders, and leaders who have taken the TEDxHarvardSquare stage. Exploring AI, biotech, climate, equity, and human potential.",
};

export default async function SpeakersPage() {
  const speakers = await getSpeakerArchive();

  // Group by edition year, newest first. The query already orders by year then
  // lineup position, so insertion order is display order.
  const byYear = new Map<number, SpeakerWithTalk[]>();
  for (const speaker of speakers) {
    if (!speaker.editionYear) continue;
    byYear.set(speaker.editionYear, [...(byYear.get(speaker.editionYear) ?? []), speaker]);
  }
  const years = [...byYear].map(([year, list]) => ({ year, speakers: list }));

  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <Reveal as="p" className="mb-6 text-label text-brand uppercase">
            The archive
          </Reveal>
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            Speakers
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 text-lead text-ink-300">
            Hear from innovators working at the frontier of AI, biology, creativity,
            climate, culture, and human connection. These are blueprints for what
            flourishing could look like in the years ahead.
          </SplitReveal>
        </header>

        {years.length > 0 ? (
          <SpeakerArchive years={years} />
        ) : (
          <p className="text-body text-muted">The speaker archive is being assembled.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
