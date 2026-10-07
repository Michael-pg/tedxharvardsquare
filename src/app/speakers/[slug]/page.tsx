import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { getArchiveSpeaker, getSiteSettings, getSpeakerArchive } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { speakerJsonLd } from "@/lib/structured-data";
import { youTubeId } from "@/lib/youtube";

/** Every archive speaker is built ahead; one added in Studio later renders on first visit. */
export async function generateStaticParams() {
  const speakers = await getSpeakerArchive();
  return speakers.map((speaker) => ({ slug: speaker.slug }));
}

/** The first sentence of a bio, for search snippets. */
const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0];

export async function generateMetadata({ params }: PageProps<"/speakers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const speaker = await getArchiveSpeaker(slug);
  if (!speaker) return {};
  const event = speaker.editionYear ? `TEDxHarvardSquare ${speaker.editionYear}` : "TEDxHarvardSquare";
  const lead = speaker.talk
    ? `${speaker.name} at ${event}: “${speaker.talk.title}”.`
    : `${speaker.name} at ${event}.`;
  return pageMetadata({
    title: speaker.name,
    description: [lead, speaker.bio && firstSentence(speaker.bio)]
      .filter(Boolean)
      .join(" "),
    path: `/speakers/${speaker.slug}`,
  });
}

/**
 * One speaker: portrait, talk, video and bio, the same material as the
 * archive's dialog given a page of its own, so it can be found by name and
 * linked to. The archive still opens the dialog for browsing; this is where a
 * shared link, a search result or a reload lands.
 */
export default async function SpeakerPage({ params }: PageProps<"/speakers/[slug]">) {
  const { slug } = await params;
  const [site, speaker, archive] = await Promise.all([getSiteSettings(), getArchiveSpeaker(slug), getSpeakerArchive()]);
  if (!speaker) notFound();

  const videoId = youTubeId(speaker.talk?.videoUrl);
  const sameEdition = archive.filter((s) => s.editionYear === speaker.editionYear && s.slug !== speaker.slug);

  return (
    <>
      <JsonLd data={speakerJsonLd(site, speaker)} />
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <Link
          href="/speakers"
          className="group mb-16 inline-flex items-center gap-2 text-small text-muted transition-colors duration-fast hover:text-foreground md:mb-24"
        >
          <ArrowLeft aria-hidden className="size-4 transition-transform duration-fast group-hover:-translate-x-0.5" />
          All speakers
        </Link>

        <article className="grid gap-12 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-5">
            {speaker.headshot ? (
              <Reveal className="relative aspect-4/5 overflow-hidden bg-ink-900 md:sticky md:top-32">
                <Image
                  src={speaker.headshot.src}
                  alt={speaker.headshot.alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </Reveal>
            ) : null}
          </div>

          <div className="md:col-span-6 md:col-start-7">
            {speaker.editionYear ? (
              <Reveal as="p" className="mb-6 text-label text-muted uppercase">
                {`TEDxHarvardSquare ${speaker.editionYear}`}
              </Reveal>
            ) : null}
            <SplitReveal as="h1" by="chars" onScroll={false} className="text-display font-medium">
              {speaker.name}
            </SplitReveal>
            {speaker.title ? (
              <Reveal as="p" delay={0.1} className="mt-4 text-label text-muted uppercase">
                {speaker.title}
              </Reveal>
            ) : null}

            {speaker.talk ? (
              <Reveal as="h2" delay={0.15} className="mt-12 text-title font-medium text-balance">
                {speaker.talk.title}
              </Reveal>
            ) : null}
            {speaker.talk?.premise ? (
              <Reveal as="p" delay={0.2} className="mt-4 text-lead text-ink-300">
                {speaker.talk.premise}
              </Reveal>
            ) : null}

            {videoId ? (
              <div className="relative mt-10 aspect-video overflow-hidden bg-ink-900">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                  title={`${speaker.name} — ${speaker.talk?.title ?? "TEDxHarvardSquare talk"}`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 size-full"
                />
              </div>
            ) : null}

            {speaker.bio ? (
              <p className="mt-12 max-w-2xl text-body text-ink-200 whitespace-pre-line">{speaker.bio}</p>
            ) : null}

            {speaker.links.length > 0 ? (
              <ul className="mt-10 flex flex-wrap gap-3">
                {speaker.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-small transition-colors hover:border-foreground"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>

        {sameEdition.length > 0 ? (
          <section aria-labelledby="same-edition" className="mt-32 border-t border-rule pt-12 md:mt-48">
            <h2 id="same-edition" className="mb-8 text-heading font-medium">
              {`Also on stage in ${speaker.editionYear}`}
            </h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {sameEdition.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/speakers/${other.slug}`}
                    className="text-lead text-ink-300 transition-colors duration-fast hover:text-foreground"
                  >
                    {other.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
