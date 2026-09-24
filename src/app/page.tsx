import { Hero } from "@/components/sections/hero";
import { Nav } from "@/components/site/nav";
import { Reveal } from "@/components/motion/reveal";
import { heroImages as placeholderHeroImages } from "@/content/hero-images";
import { getCurrentEdition, getHomePage, getSiteSettings, getTopics } from "@/content";

export default async function Home() {
  const [site, home, edition, topics] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getCurrentEdition(),
    getTopics(),
  ]);

  // The placeholders keep the choreography intact until the Studio has photos.
  const heroImages = home.heroImages.length > 0 ? home.heroImages : placeholderHeroImages;

  return (
    <>
      <Nav contactEmail={site.contactEmail} />
      <main>
        <Hero
          tagline={site.tagline}
          missionStatement={site.missionStatement}
          images={heroImages}
          editionLabel={
            edition
              ? [`Edition ${edition.number}`, edition.theme].filter(Boolean).join(" · ")
              : undefined
          }
        />

        {/*
          Everything below is still the scaffolding pass — the sections after
          the hero are deliberately unstyled beyond the type ramp until their
          content and treatment are decided.
        */}
        <section className="relative z-10 border-t border-rule bg-background px-6 py-24 md:px-12 md:py-40">
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

        <footer className="relative z-10 border-t border-rule bg-background px-6 py-12 md:px-12">
          <p className="text-small text-muted">Scaffolding build · {site.name}</p>
        </footer>
      </main>
    </>
  );
}
