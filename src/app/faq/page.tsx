import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { SquareLink } from "@/components/ui/square-link";
import { getFaqs, getPageCopy, getSiteSettings } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("faqPage");
  return pageMetadata({ title: "FAQ", description: copy.seoDescription, path: "/faq" });
}

/**
 * The numbered questions carry the page; the contact stays pinned beside them,
 * so anyone who doesn't find their answer never has to scroll for it. Plain
 * black, no dot field: people come to this page for a fact.
 */
export default async function FaqPage() {
  const [site, faqs, copy] = await Promise.all([getSiteSettings(), getFaqs(), getPageCopy("faqPage")]);
  const mailto = `mailto:${site.contactEmail}?subject=TEDxHarvardSquare`;

  return (
    <>
      <SiteNav />
      <main id="main" className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            {copy.title}
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 text-lead text-ink-300">
            {copy.intro}
          </SplitReveal>
        </header>

        <div className="grid grid-cols-4 gap-x-6 gap-y-16 md:grid-cols-12">
          <Reveal className="col-span-4 md:col-span-8">
            <FaqAccordion items={faqs} />
          </Reveal>

          <aside aria-label="Contact" className="col-span-4 md:col-span-3 md:col-start-10">
            <Reveal className="flex flex-col items-start gap-6 md:sticky md:top-32">
              <p className="text-heading font-medium text-balance">{copy.contactHeading}</p>
              <p className="text-body text-ink-300">
                {copy.contactBody}
              </p>
              <SquareLink href={mailto} variant="secondary">
                {copy.contactLabel}
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
