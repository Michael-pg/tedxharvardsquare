import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import type { SpeakerWithTalk } from "@/content";

/**
 * A few recorded talks as a list, each with a photo from the talk itself, led
 * by its title and dated by the year it was given — so the section reads as an archive to watch, not as a lineup
 * for the next edition. Rows open the video when one is published, otherwise
 * the speaker archive.
 */
export function PastTalks({ speakers }: { speakers: SpeakerWithTalk[] }) {
  return (
    <ul className="border-t border-rule">
      {speakers.map((speaker) => {
        const talk = speaker.talk!;
        const external = Boolean(talk.videoUrl);
        // The stage photo is the point; the portrait holds its place until
        // the organizers add one in Studio.
        const photo = talk.still ?? speaker.headshot;
        const content = (
          <>
            {photo && (
              <span className="relative aspect-video w-24 shrink-0 overflow-hidden bg-ink-900 md:w-40">
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 160px, 96px"
                  className="object-cover grayscale transition-[filter] duration-slow group-hover:grayscale-0"
                />
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-heading font-medium text-balance">{talk.title}</span>
              <span className="text-small text-muted">
                {[speaker.name, speaker.editionYear].filter(Boolean).join(", ")}
              </span>
            </span>
            {external ? (
              <Play aria-hidden="true" className="size-4 shrink-0 text-muted transition-colors duration-fast group-hover:text-foreground" />
            ) : (
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted" />
            )}
          </>
        );
        const className = "group flex items-center gap-5 py-5 transition-colors duration-fast hover:bg-ink-900";
        return (
          <li key={speaker.slug} className="border-b border-rule">
            {external ? (
              <a href={talk.videoUrl} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
                <span className="sr-only">(watch, opens in a new tab)</span>
              </a>
            ) : (
              <Link href="/speakers" className={className}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
