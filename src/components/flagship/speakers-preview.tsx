import Image from "next/image";
import Link from "next/link";
import { HalftonePhoto } from "@/components/home/halftone-photo";
import type { Image as ImageContent, Speaker } from "@/content";

/**
 * This edition's speakers. Once any are added to the edition in Studio they
 * show as portraits; until then, four tiles printed in coarse, blurred red
 * halftone from past stage photos, so the shape of a lineup is there without
 * pretending to name anyone.
 */
export function SpeakersPreview({ speakers, placeholders }: { speakers: Speaker[]; placeholders: ImageContent[] }) {
  if (speakers.length > 0) {
    return (
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {speakers.map((speaker) => (
          <li key={speaker.slug}>
            <Link href={`/speakers/${speaker.slug}`} className="group flex flex-col gap-4">
              <div className="relative aspect-4/5 overflow-hidden bg-ink-800">
                {speaker.headshot && (
                  <Image
                    src={speaker.headshot.src}
                    alt={speaker.headshot.alt || `Portrait of ${speaker.name}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover grayscale"
                  />
                )}
              </div>
              <div>
                <p className="text-heading font-medium transition-colors duration-fast group-hover:text-ink-300">
                  {speaker.name}
                </p>
                {speaker.title && (
                  <p className="mt-1 text-small text-muted">{speaker.title}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {placeholders.slice(0, 4).map((image, i) => (
        <li key={image.src} className="flex flex-col gap-4">
          <div className="overflow-hidden bg-ink-900">
            <HalftonePhoto
              image={{ ...image, alt: "" }}
              ratio={4 / 5}
              focus={image.focus ?? undefined}
              cell={9}
              blur={2.4}
              className="w-full"
            />
          </div>
          <p className="text-small text-muted">{`Speaker ${String(i + 1).padStart(2, "0")}`}</p>
        </li>
      ))}
    </ul>
  );
}
