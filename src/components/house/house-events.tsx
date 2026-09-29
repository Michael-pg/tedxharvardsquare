import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { HouseEvent } from "@/content";

/** House events happen in Cambridge; show their times there, whoever is reading. */
const TIME_ZONE = "America/New_York";

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: TIME_ZONE });
const weekdayTimeFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const yearFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: TIME_ZONE });
const fullDateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: TIME_ZONE });

const formatLabel: Record<HouseEvent["format"], string | undefined> = {
  mixer: "Mixer",
  "founder-dinner": "Founder dinner",
  ama: "AMA",
  salon: "Salon",
  hackathon: "Hackathon",
  workshop: "Workshop",
  other: undefined,
};

/**
 * Events as ruled rows: date on the left, what and where beside it. Upcoming
 * rows open the event's Luma page to RSVP; past rows are a record, with the
 * cover photo when there is one.
 */
export function HouseEvents({ events, past = false }: { events: HouseEvent[]; past?: boolean }) {
  return (
    <ul className="border-t border-rule">
      {events.map((event) => {
        const date = new Date(event.date);
        const meta = [formatLabel[event.format], event.venue?.name, past && event.attendeeCount ? `${event.attendeeCount} attended` : undefined]
          .filter(Boolean)
          .join(" · ");
        const content = (
          <>
            <span className="flex w-20 shrink-0 flex-col gap-1 md:w-40">
              <span className="text-heading font-medium">{past ? yearFormat.format(date) : dayFormat.format(date)}</span>
              <span className="text-small text-muted">{past ? dayFormat.format(date) : weekdayTimeFormat.format(date)}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-heading font-medium text-balance">{event.title}</span>
              {event.tagline && <span className="text-body text-ink-300">{event.tagline}</span>}
              {meta && <span className="text-small text-muted">{meta}</span>}
            </span>
            {past && event.coverImage && (
              <span className="relative hidden aspect-video w-40 shrink-0 overflow-hidden bg-ink-900 sm:block">
                <Image
                  src={event.coverImage.src}
                  alt={event.coverImage.alt}
                  fill
                  sizes="160px"
                  className="object-cover grayscale"
                />
              </span>
            )}
            {!past && event.registrationUrl && (
              <span className="flex shrink-0 items-center gap-2 text-small font-medium">
                <span className="hidden sm:inline">RSVP</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-fast ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            )}
          </>
        );
        const className = "group flex items-start gap-5 py-6";
        return (
          <li key={event.slug} className="border-b border-rule">
            {!past && event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${className} transition-colors duration-fast hover:bg-ink-900`}
              >
                {content}
                <span className="sr-only">{`(RSVP for ${fullDateFormat.format(date)}, opens in a new tab)`}</span>
              </a>
            ) : (
              <div className={className}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
