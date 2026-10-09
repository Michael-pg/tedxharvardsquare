import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { SquareLink } from "@/components/ui/square-link";
import { getFaqs, getSiteSettings } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "FAQ",
    description:
      "Answers to your questions about TEDxHarvardSquare — from tickets and venue logistics to accessibility, food, photography, and how to stay connected after the event.",
    path: "/faq",
  });
}

/**
 * The numbered questions carry the page; the contact stays pinned beside them,
 * so anyone who doesn't find their answer never has to scroll for it. Plain
 * black, no dot field: people come to this page for a fact.
 */
export default async function FaqPage() {
  const [site, faqs] = await Promise.all([getSiteSettings(), getFaqs()]);
  const mailto = `mailto:${site.contactEmail}?subject=TEDxHarvardSquare`;

  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            FAQ
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 text-lead text-ink-300">
            Ideas worth spreading start with questions worth asking. Whether you&apos;re
            curious about speakers, schedules, or snacks, we&apos;ve covered the
            essentials below.
          </SplitReveal>
        </header>

        <div className="grid grid-cols-4 gap-x-6 gap-y-16 md:grid-cols-12">
          <Reveal className="col-span-4 md:col-span-8">
            <FaqAccordion items={faqs} />
          </Reveal>

          <aside aria-label="Contact" className="col-span-4 md:col-span-3 md:col-start-10">
            <Reveal className="flex flex-col items-start gap-6 md:sticky md:top-32">
              <p className="text-heading font-medium text-balance">Still have a question?</p>
              <p className="text-body text-ink-300">
                Write to us and a member of the team will get back to you.
              </p>
              <SquareLink href={mailto} variant="secondary">
                Email us
              </SquareLink>
              <a
                href={mailto}
                className="text-small text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-foreground hover:decoration-brand"
              >
                {site.contactEmail}
              </a>
            </Reveal>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
