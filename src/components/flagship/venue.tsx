import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { SquareLink } from "@/components/ui/square-link";
import type { Image as ImageContent, Venue as VenueContent } from "@/content";

/**
 * The venue, full bleed and in colour, with the date and venue name set huge
 * over it: the second time the date appears, and the big one. The address,
 * how to get there and a Maps link sit opposite. Without a photo it is the
 * same type on black.
 */
export function Venue({
  venue,
  image,
  day,
  notes,
}: {
  venue: VenueContent;
  image?: ImageContent;
  /** The date without the year, e.g. "February 20". */
  day?: string;
  notes: string[];
}) {
  const address = [venue.addressLine, `${venue.city}, ${venue.state}`].filter(Boolean).join(", ");
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${address}`)}`;
  const focus = image?.focus ?? { x: 0.5, y: 0.5 };

  return (
    <section
      aria-labelledby="venue-title"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-40 pb-12 md:pb-16"
    >
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
            className="-z-10 object-cover"
          />
          {/* Darkens the lower half so the type reads; the room stays bright above. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
        </>
      )}

      <div className="grid grid-cols-4 items-end gap-x-6 gap-y-10 md:grid-cols-12">
        <Reveal as="h2" className="col-span-4 text-statement font-medium md:col-span-8">
          <span id="venue-title">
            {day && <span className="block">{day}</span>}
            <span className="block">{venue.name}</span>
          </span>
        </Reveal>
        <Reveal className="col-span-4 flex flex-col items-start gap-6 md:col-span-4 md:col-start-9">
          <p className="text-lead">{address}</p>
          {notes.length > 0 && (
            <div className="flex max-w-md flex-col gap-3 text-body text-ink-200">
              {notes.map((note, i) => (
                <p key={i}>{note}</p>
              ))}
            </div>
          )}
          <SquareLink href={maps} variant="secondary">
            Open in Maps
          </SquareLink>
        </Reveal>
      </div>
    </section>
  );
}
