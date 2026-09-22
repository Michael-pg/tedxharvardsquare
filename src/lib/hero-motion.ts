/**
 * Shared motion state between the DOM and the WebGL canvas.
 *
 * The hero's scroll timeline (GSAP, in React) and the blob's render loop
 * (three.js, in `useFrame`) need to agree on scroll progress and cursor
 * position 60 times a second. Routing that through React state would trigger a
 * re-render per frame, so both sides read and write this plain mutable object
 * instead. GSAP tweens `progress` directly; the shader reads it each frame.
 *
 * Values are normalised and framework-agnostic on purpose — nothing here knows
 * about pixels, viewports, or React.
 */
export const heroMotion = {
  /** 0 at rest, 1 when the blob has filled the screen. Tweened by ScrollTrigger. */
  progress: 0,
  /** Cursor in normalised device coordinates, -1..1 on both axes. */
  pointerX: 0,
  pointerY: 0,
  /**
   * False until the visitor actually moves the cursor. Without this the blob
   * would render its parting effect at (0, 0) — dead centre, behind the
   * headline — before anyone has touched the mouse.
   */
  pointerActive: false,
  /** Eased follow of the pointer, so the blob lags rather than snaps. */
  smoothX: 0,
  smoothY: 0,
  /** Drops to 0 when the hero scrolls away, so the canvas can idle. */
  opacity: 1,
  /**
   * Page-load entrance, 0 → 1. Tweened with an overshooting ease so the orb
   * bursts outward and settles before the headline arrives — the pixels get
   * the stage to themselves for the first beat.
   */
  intro: 0,
};

export type HeroMotion = typeof heroMotion;
