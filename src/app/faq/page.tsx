import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { getFaqs, getSiteSettings } from "@/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to your questions about TEDxHarvardSquare — from tickets and venue logistics to accessibility, food, photography, and how to stay connected after the event.",
};

export default async function FaqPage() {
  const [site, faqs] = await Promise.all([getSiteSettings(), getFaqs()]);

  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:px-12 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <Reveal as="p" className="mb-6 text-label text-brand uppercase">
            Flagship
          </Reveal>
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            FAQ
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 text-lead text-ink-300">
            Ideas worth spreading start with questions worth asking. Whether you&apos;re
            curious about speakers, schedules, or snacks, we&apos;ve covered the
            essentials below.
          </SplitReveal>
        </header>

        <Reveal className="max-w-5xl">
          <FaqAccordion items={faqs} />
        </Reveal>

        <Reveal as="p" className="mt-20 text-body text-muted">
          Still have a question? Email{" "}
          <a
            href={`mailto:${site.contactEmail}?subject=TEDxHarvardSquare`}
            className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-brand"
          >
            {site.contactEmail}
          </a>
          .
        </Reveal>
      </main>
    </>
  );
}
