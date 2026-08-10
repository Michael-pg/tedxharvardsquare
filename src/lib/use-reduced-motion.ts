"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** The server cannot know the preference; CSS covers the gap until hydration. */
function getServerSnapshot() {
  return false;
}

/**
 * Tracks `prefers-reduced-motion`.
 *
 * Every scroll-driven or looping animation on this site must respect this.
 * Components should skip *creating* tweens when it returns true rather than
 * creating and then reverting them.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
