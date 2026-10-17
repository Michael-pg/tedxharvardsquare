import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";
import { SquareLink } from "@/components/ui/square-link";
import { getHomePage, getPageCopy, getTeam, type Image as ImageContent } from "@/content";
import { TEDX_PROGRAM_URL, TED_PROGRAMS_URL, aboutTed, aboutTedx } from "@/content/tedx";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("aboutPage");
  return pageMetadata({ title: "About", description: copy.seoDescription, path: "/about" });
}

const focusOf = (image: ImageContent) => `${(image.focus?.x ?? 0.5) * 100}% ${(image.focus?.y ?? 0.5) * 100}%`;

/** Gallery columns by photo count, so two or three photos still fill the row. */
const GALLERY_COLUMNS = ["", "", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

/**
 * About: who we are (Studio → Pages → About), a feature photo, what we do
 * (Flagship and House, equal weight), a gallery, the team, then the "About TEDx"
 * and "About TED" sections the TEDx licence requires on every event's About
 * page, word for word (`@/content/tedx`).
 *
 * The photos are the home page's event photography (Studio → Pages → Home). The
 * team, names and roles only, renders only when Team member documents exist.
 */
export default async function AboutPage() {
  const [copy, home, team] = await Promise.all([
    getPageCopy("aboutPage"),
    getHomePage(),
    getTeam(),
  ]);

  const photos = home.heroImages.filter((image) => Boolean(image?.src));
  const feature = photos[5] ?? photos[0];
  const gallery = [photos[0], photos[2], photos[3], photos[1]]
    .filter((image): image is ImageContent => Boolean(image?.src) && image.src !== feature?.src)
    .slice(0, 4);
  const people = team.filter((member) => member.name);

  return (
    <>
      <SiteNav />
      <main id="main" className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-16 max-w-4xl md:mb-24">
          <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
            {copy.title}
          </SplitReveal>
          <SplitReveal as="p" delay={0.2} onScroll={false} className="mt-8 max-w-3xl text-lead text-ink-300">
            {copy.intro}
          </SplitReveal>
          <Reveal as="p" delay={0.3} className="mt-6 max-w-3xl text-body text-muted">
            {copy.body}
          </Reveal>
        </header>

        {feature && (
          <Reveal className="relative mb-24 aspect-4/3 overflow-hidden bg-ink-900 md:mb-40 md:aspect-21/9">
            <Image
              src={feature.src}
              alt={feature.alt}
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: focusOf(feature) }}
              className="object-cover"
            />
          </Reveal>
        )}

        {/* What we do: Flagship and House side by side, the same size. */}
        <section aria-labelledby="about-do" className="mb-24 md:mb-40">
          <Reveal as="h2" className="max-w-4xl text-title font-medium text-balance">
            <span id="about-do">{copy.doHeading}</span>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 md:mt-20 md:grid-cols-2">
            <Reveal className="flex flex-col items-start gap-6 border-t border-rule pt-8">
              <h3 className="text-heading font-medium">{copy.flagshipTitle}</h3>
              <p className="max-w-xl text-body text-ink-200">{copy.flagshipText}</p>
              <SquareLink href="/flagship" variant="secondary">
                {copy.flagshipLabel}
              </SquareLink>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col items-start gap-6 border-t border-rule pt-8">
              <h3 className="text-heading font-medium">{copy.houseTitle}</h3>
              <p className="max-w-xl text-body text-ink-200">{copy.houseText}</p>
              <SquareLink href="/house" variant="secondary">
                {copy.houseLabel}
              </SquareLink>
            </Reveal>
          </div>
        </section>

        {gallery.length >= 2 && (
          <Reveal
            stagger
            className={`mb-24 grid grid-cols-2 gap-x-6 gap-y-6 md:mb-40 ${GALLERY_COLUMNS[gallery.length]}`}
          >
            {gallery.map((image, i) => (
              <div
                key={image.src}
                className={`relative overflow-hidden bg-ink-900 ${i % 2 === 0 ? "aspect-4/5" : "mt-12 aspect-4/5 md:mt-24"}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  style={{ objectPosition: focusOf(image) }}
                  className="object-cover"
                />
              </div>
            ))}
          </Reveal>
        )}

        {people.length > 0 && (
          <section aria-labelledby="about-team" className="mb-24 md:mb-40">
            <Reveal as="h2" className="max-w-4xl text-title font-medium text-balance">
              <span id="about-team">{copy.teamHeading}</span>
            </Reveal>
            <Reveal as="p" className="mt-6 max-w-3xl text-body text-ink-300">
              {copy.teamIntro}
            </Reveal>
            <Reveal
              as="ul"
              stagger
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:mt-20 lg:grid-cols-4"
            >
              {people.map((member) => (
                <li key={member.slug}>
                  <h3 className="text-heading font-medium">{member.name}</h3>
                  <p className="mt-1 text-small text-muted">{member.role}</p>
                </li>
              ))}
            </Reveal>
          </section>
        )}

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
