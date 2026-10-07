import { getArchiveSpeaker, getSpeakerArchive } from "@/content";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "A TEDxHarvardSquare speaker";
export const size = ogSize;
export const contentType = "image/png";

/** Built with the pages, rather than on each share. */
export async function generateStaticParams() {
  const speakers = await getSpeakerArchive();
  return speakers.map((speaker) => ({ slug: speaker.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const speaker = await getArchiveSpeaker(slug);
  return ogImage({
    title: speaker?.name ?? "Speakers",
    eyebrow: speaker?.talk?.title ?? (speaker?.editionYear ? `TEDxHarvardSquare ${speaker.editionYear}` : undefined),
    portrait: speaker?.headshot?.src,
  });
}
