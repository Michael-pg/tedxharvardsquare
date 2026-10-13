"use client";

/**
 * The home page's loader: the page opens on black, a counter runs to 100
 * while the dot field gathers into order, and then the hero copy and the nav
 * arrive. It plays when someone lands on home after time away; a reload, or a
 * return to home while browsing the site, shows the page as it is.
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

/** How long since the last page seen on the site before the loader plays again. */
const AWAY_MS = 30 * 60 * 1000;
const KEY = "tedx:last-seen";

/** Decided once per page load, so every part agrees and a later write cannot flip it. */
let pending: boolean | undefined;

/** True while the loader should play on this page load. */
export function introPending() {
  if (pending === undefined) {
    if (typeof window === "undefined") return false;
    let lastSeen = 0;
    try {
      lastSeen = Number(window.localStorage.getItem(KEY)) || 0;
    } catch {
      // Storage blocked: no record of a visit, so the loader plays.
    }
    pending = window.location.pathname === "/" && Date.now() - lastSeen > AWAY_MS;
  }
  return pending;
}

/**
 * Notes that the site is being browsed now. Called on every page and as it is
 * left. Any page other than home also ends the loader's turn for this page
 * load, so a client-side return to home shows the page as it is.
 */
export function markVisit() {
  introPending();
  if (window.location.pathname !== "/") pending = false;
  try {
    window.localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: the loader plays on every fresh load of home.
  }
}
