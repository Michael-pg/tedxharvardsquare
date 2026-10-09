"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { gsap, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { youTubeId } from "@/lib/youtube";
import type { SpeakerWithTalk } from "@/content/types";
import { PrintedPortrait } from "./printed-portrait";

export type ArchiveEdition = {
  slug: string;
  number: number;
  year: number;
  theme?: string;
  /** The date as it should read, or the year when only that is known. */
  when: string;
  venue?: string;
  speakers: SpeakerWithTalk[];
  /** Performers are credited under the lineup rather than given a portrait. */
  performers: { name: string; credit?: string }[];
};

const ARCHIVE_PATH = "/speakers";
const speakerPath = (slug: string) => `${ARCHIVE_PATH}/${slug}`;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The speaker archive: every edition on one page, newest first. Each edition
 * is a numbered section whose facts stay pinned beside its lineup while the
 * lineup scrolls past; portraits arrive as red halftone prints and develop
 * into photographs (`PrintedPortrait`).
 *
 * Each speaker is a real link to their own page (`/speakers/[slug]`), which is
 * what crawlers, new tabs and shared links get. A plain click opens the dialog
 * instead, for quick browsing, and pushes the page's URL: the address bar is
 * always shareable, a reload lands on the full page, and Back closes the
 * dialog. Old `#slug` links still open the dialog. Inside it, the arrows (and
 * ← → keys) step through the whole archive without closing.
 */
export function SpeakerArchive({ editions }: { editions: ArchiveEdition[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  /** Whether opening the dialog added a history entry that closing should undo. */
  const pushed = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const all = editions.flatMap((edition) => edition.speakers);
  const index = all.findIndex((speaker) => speaker.slug === openSlug);
  const open = index >= 0 ? all[index] : null;
  const prev = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const openEdition = open ? editions.find((e) => e.speakers.includes(open)) : undefined;

  const openSpeaker = useCallback(
    (slug: string, { push }: { push: boolean }) => {
      if (!all.some((s) => s.slug === slug)) return;
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

  // ← → step through the archive while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.key === "ArrowLeft" ? prev : event.key === "ArrowRight" ? next : null;
      if (!target) return;
      event.preventDefault();
      openSpeaker(target.slug, { push: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next, openSpeaker]);

  // Show the dialog once its content has rendered, then animate it in.
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element || element.open) return;
    element.showModal();
    if (!reducedMotion && panel.current) {
      // Phones get a full-screen sheet that slides up; larger screens a panel
      // that rises a little.
      const sheet = !window.matchMedia("(min-width: 768px)").matches;
      gsap.fromTo(
        panel.current,
        sheet ? { yPercent: 100 } : { autoAlpha: 0, y: 24 },
        {
          ...(sheet ? { yPercent: 0 } : { autoAlpha: 1, y: 0 }),
          duration: timing.duration.base,
          ease: timing.ease.expo,
          clearProps: "transform",
        },
      );
    }
  }, [open, reducedMotion]);

  // Stepping to another speaker: start their text at the top, and fade it in.
  useEffect(() => {
    const element = column.current;
    if (!openSlug || !element || !dialog.current?.open) return;
    element.scrollTop = 0;
    if (!reducedMotion) {
      gsap.fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, duration: timing.duration.fast });
    }
  }, [openSlug, reducedMotion]);

  const videoId = youTubeId(open?.talk?.videoUrl);

  return (
    <>
      {editions.map((edition) => (
        <EditionSection
          key={edition.slug}
          edition={edition}
          onOpen={(slug) => openSpeaker(slug, { push: true })}
        />
      ))}

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
        className={[
          // Full-screen sheet on phones; from md up, a panel of one fixed size
          // centred in the viewport, so every speaker opens into the same frame.
          "m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-foreground",
          "open:flex md:items-center md:justify-center md:p-8",
          "backdrop:bg-ink-950/85 backdrop:backdrop-blur-sm",
        ].join(" ")}
      >
        {open ? (
          <div
            ref={panel}
            className="relative flex size-full flex-col bg-ink-900 md:max-h-dialog md:max-w-5xl md:flex-row md:border md:border-rule"
          >
            <button
              type="button"
              onClick={closeSpeaker}
              // Backed, so it reads over the portrait where they meet.
              className="absolute top-4 right-4 z-10 inline-flex size-10 items-center justify-center rounded-full border border-rule bg-ink-900/80 text-ink-200 backdrop-blur-md transition-colors hover:border-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X aria-hidden className="size-4" />
            </button>

            {/* Desktop: the portrait fills the panel's left side and never scrolls. */}
            {open.headshot ? (
              <div className="relative hidden bg-ink-800 md:block md:w-2/5 md:shrink-0">
                <Image
                  key={open.slug}
                  src={open.headshot.src}
                  alt={open.headshot.alt}
                  fill
                  sizes="40vw"
                  style={{ objectPosition: `${(open.headshot.focus?.x ?? 0.5) * 100}% ${(open.headshot.focus?.y ?? 0.3) * 100}%` }}
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {/* The only thing that scrolls; it never hands the scroll on to the page. */}
              <div ref={column} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-20 pb-12 md:px-12 md:pt-12">
                {open.headshot ? (
                  <div className="relative mb-10 aspect-4/5 overflow-hidden bg-ink-800 md:hidden">
                    <Image
                      key={open.slug}
                      src={open.headshot.src}
                      alt={open.headshot.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                {openEdition ? (
                  <p className="mb-4 flex items-center gap-3 text-label text-muted uppercase">
                    <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                    {`Edition ${openEdition.number} · ${openEdition.year}`}
                  </p>
                ) : null}
                <h2 id="speaker-dialog-name" className="pr-12 text-title font-medium text-balance">
                  {open.name}
                </h2>
                {open.title ? (
                  <p className="mt-3 text-label text-muted uppercase">{open.title}</p>
                ) : null}
                {open.talk ? (
                  <p className="mt-8 text-lead font-medium text-balance">{open.talk.title}</p>
                ) : null}

                {videoId ? (
                  <div className="relative mt-8 aspect-video overflow-hidden bg-ink-950">
                    <iframe
                      key={videoId}
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

              {/* Pinned under the text: step through the archive without closing. */}
              <nav aria-label="More speakers" className="flex shrink-0 items-stretch border-t border-rule">
                <StepButton speaker={prev} direction="prev" onStep={(slug) => openSpeaker(slug, { push: false })} />
                <p className="flex items-center border-x border-rule px-4 text-small text-muted tabular-nums" aria-live="polite">
                  {`${index + 1} / ${all.length}`}
                </p>
                <StepButton speaker={next} direction="next" onStep={(slug) => openSpeaker(slug, { push: false })} />
              </nav>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

/** One edition: its number and facts pinned on the left, the lineup on the right. */
function EditionSection({ edition, onOpen }: { edition: ArchiveEdition; onOpen: (slug: string) => void }) {
  const talks = edition.speakers.filter((s) => s.talk).length;
  const titleId = `edition-${edition.number}`;
  return (
    <section
      aria-labelledby={titleId}
      className="grid grid-cols-4 gap-x-6 gap-y-12 border-t border-rule py-16 md:grid-cols-12 md:py-24"
    >
      <Reveal className="col-span-4 md:col-span-3">
        <div className="flex flex-col gap-6 md:sticky md:top-32">
          <h2 id={titleId} className="flex flex-col gap-3">
            <span className="flex items-center gap-3 text-label text-muted uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              Edition
            </span>
            <span className="text-statement font-medium tabular-nums">
              <span className="sr-only">{`${edition.number}, ${edition.year}`}</span>
              <span aria-hidden>{pad(edition.number)}</span>
            </span>
          </h2>
          <div className="flex flex-col gap-1">
            {edition.theme ? <p className="mb-2 text-heading font-medium text-balance">{edition.theme}</p> : null}
            <p className="text-body text-ink-200">{edition.when}</p>
            {edition.venue ? <p className="text-body text-muted">{edition.venue}</p> : null}
            {talks > 0 ? <p className="text-body text-muted">{`${talks} talks`}</p> : null}
          </div>
        </div>
      </Reveal>

      <div className="col-span-4 md:col-span-9">
        <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {edition.speakers.map((speaker) => (
            <li key={speaker.slug}>
              <SpeakerCard speaker={speaker} onOpen={onOpen} />
            </li>
          ))}
        </ul>

        {edition.performers.length > 0 ? (
          <Reveal className="mt-16 border-t border-rule pt-6">
            <h3 className="mb-4 text-label text-muted uppercase">Also on stage</h3>
            <ul className="flex flex-col gap-3">
              {edition.performers.map((performer) => (
                <li key={performer.name} className="text-body">
                  <span className="font-medium">{performer.name}</span>
                  {performer.credit ? <span className="text-muted">{`, ${lowerFirst(performer.credit)}`}</span> : null}
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

/** "Accompanied by …" reads as part of the sentence after a comma. */
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function SpeakerCard({ speaker, onOpen }: { speaker: SpeakerWithTalk; onOpen: (slug: string) => void }) {
  return (
    <Link
      href={speakerPath(speaker.slug)}
      prefetch={false}
      onClick={(event) => {
        // Modified clicks (new tab, new window) follow the link.
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onOpen(speaker.slug);
      }}
      className="group block w-full text-left"
      aria-haspopup="dialog"
    >
      <div className="relative mb-6">
        {speaker.headshot ? (
          <PrintedPortrait
            image={speaker.headshot}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 100vw"
          />
        ) : (
          <div className="aspect-4/5 bg-ink-900" />
        )}
        {speaker.talk?.videoUrl ? (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-label text-foreground uppercase backdrop-blur-md">
            <Play aria-hidden className="size-3 fill-current" />
            Watch
          </span>
        ) : null}
      </div>
      <h3 className="text-heading font-medium">{speaker.name}</h3>
      {speaker.title ? <p className="mt-2 text-label text-muted uppercase">{speaker.title}</p> : null}
      {speaker.talk ? (
        <p className="mt-4 text-body text-ink-300 transition-colors duration-fast group-hover:text-foreground">
          {speaker.talk.title}
        </p>
      ) : null}
    </Link>
  );
}

function StepButton({
  speaker,
  direction,
  onStep,
}: {
  speaker: SpeakerWithTalk | null;
  direction: "prev" | "next";
  onStep: (slug: string) => void;
}) {
  const Arrow = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      disabled={!speaker}
      onClick={() => speaker && onStep(speaker.slug)}
      aria-label={speaker ? `${direction === "prev" ? "Previous" : "Next"}: ${speaker.name}` : undefined}
      className={[
        "group flex min-w-0 flex-1 items-center gap-3 px-6 py-4 text-small text-ink-300 transition-colors duration-fast",
        "hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        direction === "next" ? "flex-row-reverse text-right" : "",
      ].join(" ")}
    >
      <Arrow
        aria-hidden
        className={`size-4 shrink-0 transition-transform duration-fast ${direction === "prev" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
      />
      <span className="truncate">{speaker ? speaker.name : direction === "prev" ? "Previous" : "Next"}</span>
    </button>
  );
}
