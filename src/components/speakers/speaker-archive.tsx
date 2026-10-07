"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { gsap, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { youTubeId } from "@/lib/youtube";
import type { SpeakerWithTalk } from "@/content/types";

type SpeakerArchiveProps = {
  /** Speakers grouped by edition year, newest year first. */
  years: { year: number; speakers: SpeakerWithTalk[] }[];
};

const ARCHIVE_PATH = "/speakers";
const speakerPath = (slug: string) => `${ARCHIVE_PATH}/${slug}`;

/**
 * The speaker archive: a year switcher over a lineup, with each speaker opening
 * into a dialog holding the full bio and — once published — the talk itself.
 *
 * Each speaker is a real link to their own page (`/speakers/[slug]`), which is
 * what crawlers, new tabs and shared links get. A plain click opens the dialog
 * instead, for quick browsing, and pushes the page's URL: the address bar is
 * always shareable, a reload lands on the full page, and Back closes the
 * dialog. Old `#slug` links still open the dialog.
 */
export function SpeakerArchive({ years }: SpeakerArchiveProps) {
  const [activeYear, setActiveYear] = useState(years[0]?.year);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  /** Whether opening the dialog added a history entry that closing should undo. */
  const pushed = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const all = years.flatMap((group) => group.speakers);
  const open = all.find((speaker) => speaker.slug === openSlug) ?? null;
  const lineup = years.find((group) => group.year === activeYear)?.speakers ?? [];

  const openSpeaker = useCallback(
    (slug: string, { push }: { push: boolean }) => {
      const speaker = all.find((s) => s.slug === slug);
      if (!speaker) return;
      if (speaker.editionYear) setActiveYear(speaker.editionYear);
      setOpenSlug(slug);
      if (push) {
        history.pushState(null, "", speakerPath(slug));
        pushed.current = true;
      } else {
        history.replaceState(null, "", speakerPath(slug));
      }
    },
    [all],
  );

  /** Clears the open speaker and puts the archive's URL back. Safe to call more than once. */
  const handleClosed = useCallback(() => {
    setOpenSlug(null);
    if (pushed.current) {
      pushed.current = false;
      history.back();
    } else if (location.pathname !== ARCHIVE_PATH || location.hash) {
      history.replaceState(null, "", ARCHIVE_PATH + location.search);
    }
  }, []);

  // The dialog's `close` event is queued as a task, which browsers throttle in
  // background tabs — so explicit closes clean up directly rather than waiting.
  // Escape still arrives through `onClose`.
  const closeSpeaker = useCallback(() => {
    dialog.current?.close();
    handleClosed();
  }, [handleClosed]);

  // Old deep links: /speakers#jeff-harmon opens straight into that speaker.
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(location.hash.slice(1));
      if (slug) openSpeaker(slug, { push: false });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // Runs once on mount; `openSpeaker` is stable enough for the hash listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back while the dialog is open has already left the speaker's URL, so the
  // dialog just closes, without touching history again.
  useEffect(() => {
    const onPopState = () => {
      if (location.pathname !== ARCHIVE_PATH) return;
      pushed.current = false;
      dialog.current?.close();
      setOpenSlug(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Show the dialog once its content has rendered, then animate it in.
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element || element.open) return;
    element.showModal();
    if (!reducedMotion && panel.current) {
      // Phones get a full-screen sheet that slides up; larger screens a panel
      // that rises a little. The transform is cleared afterwards because it
      // would otherwise pin the sheet's fixed close button to the panel.
      const sheet = !window.matchMedia("(min-width: 768px)").matches;
      gsap.fromTo(
        panel.current,
        sheet ? { yPercent: 100 } : { autoAlpha: 0, y: 32 },
        {
          ...(sheet ? { yPercent: 0 } : { autoAlpha: 1, y: 0 }),
          duration: timing.duration.base,
          ease: timing.ease.expo,
          clearProps: "transform",
        },
      );
    }
  }, [open, reducedMotion]);

  const videoId = youTubeId(open?.talk?.videoUrl);

  return (
    <>
      {years.length > 1 ? (
        <div role="tablist" aria-label="Edition year" className="mb-16 flex gap-3">
          {years.map(({ year }) => (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={year === activeYear}
              onClick={() => setActiveYear(year)}
              className={cn(
                "rounded-full border px-6 py-2 text-body font-medium",
                "transition-colors duration-300 ease-out-quart",
                year === activeYear
                  ? "border-foreground bg-foreground text-background"
                  : "border-rule text-muted hover:border-ink-500 hover:text-foreground",
              )}
            >
              {year}
            </button>
          ))}
        </div>
      ) : null}

      {/* Keyed by year so the stagger replays when the lineup changes. */}
      <Reveal
        key={activeYear}
        as="ul"
        stagger
        className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {lineup.map((speaker) => (
          <li key={speaker.slug}>
            <Link
              href={speakerPath(speaker.slug)}
              prefetch={false}
              onClick={(event) => {
                // Modified clicks (new tab, new window) follow the link.
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                openSpeaker(speaker.slug, { push: true });
              }}
              className="group block w-full text-left"
              aria-haspopup="dialog"
            >
              <div className="relative mb-6 aspect-4/5 overflow-hidden bg-ink-900">
                {speaker.headshot ? (
                  <Image
                    src={speaker.headshot.src}
                    alt={speaker.headshot.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={cn(
                      "object-cover grayscale transition duration-700 ease-out-quart",
                      "group-hover:scale-105 group-hover:grayscale-0",
                      "group-focus-visible:grayscale-0",
                    )}
                  />
                ) : null}
                {speaker.talk?.videoUrl ? (
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-label text-foreground uppercase backdrop-blur-md">
                    <Play aria-hidden className="size-3 fill-current" />
                    Watch
                  </span>
                ) : null}
              </div>
              <h2 className="text-heading font-medium">{speaker.name}</h2>
              {speaker.title ? (
                <p className="mt-2 text-label text-muted uppercase">{speaker.title}</p>
              ) : null}
              {speaker.talk ? (
                <p className="mt-4 text-body text-ink-200 transition-colors duration-300 group-hover:text-brand">
                  {speaker.talk.title}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </Reveal>

      <dialog
        ref={dialog}
        onClose={handleClosed}
        // Escape fires `cancel` synchronously, ahead of the queued `close`.
        onCancel={handleClosed}
        // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
        onClick={(event) => {
          if (event.target === dialog.current) closeSpeaker();
        }}
        aria-labelledby="speaker-dialog-name"
        className={cn(
          // Full-screen sheet on phones; a centred panel from md up.
          "m-0 h-dvh max-h-none w-full max-w-none overscroll-contain bg-transparent p-0 text-foreground",
          "md:m-auto md:h-auto md:max-h-full md:max-w-5xl md:p-8",
          "backdrop:bg-ink-950/85 backdrop:backdrop-blur-sm",
        )}
      >
        {open ? (
          <div
            ref={panel}
            className="relative grid min-h-full content-start gap-8 bg-ink-900 px-6 pt-20 pb-12 md:min-h-0 md:grid-cols-5 md:gap-12 md:border md:border-rule md:p-12"
          >
            <button
              type="button"
              onClick={closeSpeaker}
              // Fixed on the phone sheet so it stays reachable while scrolling;
              // backed so it reads over the portrait if they meet.
              className="fixed top-4 right-4 z-10 md:absolute inline-flex size-10 items-center justify-center rounded-full border border-rule bg-ink-900/80 text-ink-200 backdrop-blur-md transition-colors hover:border-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X aria-hidden className="size-4" />
            </button>

            <div className="md:col-span-2">
              {open.headshot ? (
                <div className="relative aspect-4/5 overflow-hidden bg-ink-800">
                  <Image
                    src={open.headshot.src}
                    alt={open.headshot.alt}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="md:col-span-3">
              {open.editionYear ? (
                <p className="mb-4 text-label text-brand uppercase">{open.editionYear}</p>
              ) : null}
              <h2 id="speaker-dialog-name" className="text-title font-medium">
                {open.name}
              </h2>
              {open.title ? (
                <p className="mt-3 text-label text-muted uppercase">{open.title}</p>
              ) : null}
              {open.talk ? (
                <p className="mt-8 text-lead font-medium text-balance">
                  {open.talk.title}
                </p>
              ) : null}

              {videoId ? (
                <div className="relative mt-8 aspect-video overflow-hidden bg-ink-950">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={`${open.name} — ${open.talk?.title ?? "TEDxHarvardSquare talk"}`}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 size-full"
                  />
                </div>
              ) : null}

              {open.bio ? (
                <p className="mt-8 text-body text-ink-200 whitespace-pre-line">{open.bio}</p>
              ) : null}

              {open.links.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-3">
                  {open.links.map((link) => (
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
          </div>
        ) : null}
      </dialog>
    </>
  );
}
