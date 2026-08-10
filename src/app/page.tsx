import { ProbeScene } from "@/components/canvas/scenes/probe";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { getCurrentEdition, getTopics, missionStatement, site } from "@/content";

/**
 * SCAFFOLDING PAGE — not a design.
 *
 * This exists to prove the stack renders end to end: server-side content
 * fetching, GSAP SplitText and ScrollTrigger, and a three.js canvas behind the
 * SSR boundary. Replace it once the visual concept is chosen.
 */
export default async function Home() {
  const [edition, topics] = await Promise.all([getCurrentEdition(), getTopics()]);

  return (
    <main>
      <section className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pb-16 md:px-12 md:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
          <ProbeScene />
        </div>

        {edition ? (
          <Reveal
            as="p"
            className="mb-8 text-label text-brand uppercase"
            y={12}
          >
            Edition {edition.number} · {edition.theme}
          </Reveal>
        ) : null}

        <SplitReveal
          as="h1"
          by="chars"
          onScroll={false}
          delay={0.15}
          className="max-w-5xl text-hero font-medium text-balance"
        >
          {site.tagline}
        </SplitReveal>
      </section>

      <section className="border-t border-rule px-6 py-24 md:px-12 md:py-40">
        <SplitReveal
          as="p"
          by="lines"
          className="max-w-4xl text-title font-medium text-balance"
        >
          {missionStatement}
        </SplitReveal>
      </section>

      <section className="border-t border-rule px-6 py-24 md:px-12 md:py-40">
        <Reveal as="h2" className="mb-12 text-label text-muted uppercase">
          What we program against
        </Reveal>

        <Reveal as="ul" stagger className="max-w-5xl">
          {topics.map((topic) => (
            <li
              key={topic.slug}
              className="border-b border-rule py-5 text-heading font-medium"
            >
              {topic.label}
            </li>
          ))}
        </Reveal>
      </section>

      <footer className="border-t border-rule px-6 py-12 md:px-12">
        <p className="text-small text-muted">
          Scaffolding build · {site.name}
        </p>
      </footer>
    </main>
  );
}
