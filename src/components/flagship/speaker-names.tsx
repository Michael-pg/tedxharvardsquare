"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Speaker } from "@/content";
import { cn } from "@/lib/utils";

/**
 * This edition's lineup as a list of names set large, one per line. On
 * desktop, pointing at a name (or focusing it) lights it and shows the
 * portrait and title beside the list; the first speaker shows until then.
 * This is a teaser for the lineup: every face stays visible on /speakers.
 * On phones there is no hover, so each name carries its portrait inline.
 */
export function SpeakerNames({ speakers }: { speakers: Speaker[] }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = speakers.find((s) => s.slug === active) ?? speakers[0];

  return (
    <div className="grid grid-cols-4 gap-x-6 md:grid-cols-12">
      <ul className="col-span-4 md:col-span-8" onPointerLeave={() => setActive(null)}>
        {speakers.map((speaker) => (
          <li key={speaker.slug}>
            <Link
              href={`/speakers/${speaker.slug}`}
              onPointerEnter={() => setActive(speaker.slug)}
              onFocus={() => setActive(speaker.slug)}
              className="flex items-center gap-4 py-1"
            >
              {speaker.headshot && (
                <span className="relative aspect-4/5 w-14 shrink-0 overflow-hidden bg-ink-800 md:hidden">
                  <Image
                    src={speaker.headshot.src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
              )}
              <span
                className={cn(
                  "text-statement font-medium transition-colors duration-fast",
                  active === null || active === speaker.slug ? "text-foreground" : "text-muted",
                )}
              >
                {speaker.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {shown && (
        <div aria-hidden className="hidden md:col-span-3 md:col-start-10 md:block">
          <div className="sticky top-32 flex flex-col gap-4">
            <div className="relative aspect-4/5 overflow-hidden bg-ink-800">
              {shown.headshot && (
                <Image
                  key={shown.slug}
                  src={shown.headshot.src}
                  alt=""
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-heading font-medium">{shown.name}</p>
              {shown.title && <p className="mt-1 text-small text-muted">{shown.title}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
