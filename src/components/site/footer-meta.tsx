"use client";

import { ArrowUp } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

const getTime = () => clock.format(new Date());
/** The server cannot know the visitor's moment; the time fills in on hydration. */
const getServerTime = () => null;

/** Local time in Cambridge — a small signal that this is a real place. */
export function CambridgeTime() {
  const time = useSyncExternalStore(subscribe, getTime, getServerTime);
  return (
    <p className="text-small text-muted">
      Cambridge, MA{" "}
      <time className="text-ink-300 tabular-nums" suppressHydrationWarning>
        {time ? `· ${time}` : ""}
      </time>
    </p>
  );
}

export function BackToTop() {
  const reducedMotion = useReducedMotion();
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
      className="group inline-flex items-center gap-2 text-small text-ink-300 transition-colors duration-fast hover:text-foreground"
    >
      Back to top
      <ArrowUp
        aria-hidden="true"
        className="size-4 transition-transform duration-fast ease-out-quart group-hover:-translate-y-0.5"
      />
    </button>
  );
}
