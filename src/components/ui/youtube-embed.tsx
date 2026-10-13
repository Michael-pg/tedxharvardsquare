"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * A YouTube talk that loads only when asked for. Until the play button is
 * pressed this is a thumbnail and a button; the player iframe (about 1 MB of
 * script, fonts and cookies from YouTube) comes in on click and starts
 * playing. Embedding the iframe up front cost the speaker pages most of their
 * mobile Lighthouse score.
 */
export function YouTubeEmbed({
  videoId,
  title,
  className,
}: {
  videoId: string;
  /** Names the video for screen readers: speaker and talk title. */
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative aspect-video overflow-hidden ${className ?? ""}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's CDN already serves this sized; no need to proxy it through image optimisation */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover opacity-80 transition-opacity duration-fast group-hover:opacity-100"
          />
          <span className="absolute bottom-0 left-0 flex size-14 items-center justify-center bg-foreground text-background transition-colors duration-fast group-hover:bg-brand group-hover:text-foreground group-focus-visible:bg-brand group-focus-visible:text-foreground">
            <Play aria-hidden="true" className="size-5 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
