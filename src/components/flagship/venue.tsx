import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { SquareLink } from "@/components/ui/square-link";
import type { Image as ImageContent, Venue as VenueContent } from "@/content";

/**
 * The venue as a split band: the room, full bleed, on one half; on the other
 * a paper panel with the address, a Maps link and how to get there.
 */
export function Venue({
  venue,
  image,
  when,
  notes,
}: {
  venue: VenueContent;
  image?: ImageContent;
  when?: string;
  notes: string[];
}) {
  const address = [venue.addressLine, `${venue.city}, ${venue.state}`].filter(Boolean).join(", ");
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${address}`)}`;
  const focus = image?.focus ?? { x: 0.5, y: 0.5 };

  return (
    <section aria-labelledby="venue-title" className="grid md:grid-cols-2">
      {image && (
        <div className="relative aspect-4/3 overflow-hidden bg-ink-900 md:aspect-auto md:min-h-svh">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
            className="object-cover grayscale"
          />
        </div>
      )}
      <div
        data-nav-theme="light"
        className={`flex flex-col justify-center gap-8 bg-ink-50 px-6 py-24 text-ink-950 md:px-12 md:py-40 ${image ? "" : "md:col-span-2"}`}
      >
        <Reveal as="h2" className="text-display font-medium text-balance">
          <span id="venue-title">{venue.name}</span>
        </Reveal>
        <Reveal className="flex flex-col gap-1 text-lead">
          <p>{address}</p>
          {when && <p className="text-ink-600">{when}</p>}
        </Reveal>
        {notes.length > 0 && (
          <Reveal className="flex max-w-md flex-col gap-3 border-t border-ink-200 pt-6 text-body text-ink-600">
            {notes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </Reveal>
        )}
        <Reveal>
          <SquareLink href={maps} variant="secondary" tone="light">
            Open in Maps
          </SquareLink>
        </Reveal>
      </div>
    </section>
  );
}
