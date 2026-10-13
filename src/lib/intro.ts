"use client";

/**
 * The home page's loader: once per browser session, the page opens on black,
 * a counter runs to 100 while the dot field gathers into order, and then the
 * hero copy and the nav arrive. Later visits in the same session skip it.
 *
 * The parts live in different components (`HomeIntro`, `DotField`, `Nav`), so
 * the timing lives here, in seconds from mount.
 */
export const INTRO = {
  /** The dot field gathering from scattered to settled. */
  gather: 3.4,
  /** The counter running to 100. */
  count: 2.4,
  /** The hero copy starts to arrive. */
  reveal: 2.6,
  /** The nav drops in, after the headline. */
  nav: 3.1,
} as const;

const KEY = "tedx:intro";

/** True until the loader has played through once this session. */
export function introPending() {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;
  try {
    return window.sessionStorage.getItem(KEY) !== "seen";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    window.sessionStorage.setItem(KEY, "seen");
  } catch {
    // Storage blocked: the loader simply plays again next time.
  }
}
