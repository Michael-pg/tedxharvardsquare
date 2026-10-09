/**
 * The site's one pointer effect: a tapering trail, like a comet's tail, that
 * every dot surface reads from instead of drawing its own orb. The pointer
 * leaves points behind; each point holds a disc that shrinks and fades as it
 * ages, so the effect is widest at the pointer and thins out along its path.
 *
 * Coordinates are whatever the caller uses (canvas pixels, viewport pixels);
 * the trail only stores and decays them. Call `step` once a frame and
 * `sample` per dot.
 */

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

type Point = { x: number; y: number; life: number };

export type PointerTrail = ReturnType<typeof createPointerTrail>;

export function createPointerTrail({
  life = 0.9,
  maxPoints = 80,
}: {
  /** How long a point lasts, in seconds. */
  life?: number;
  maxPoints?: number;
} = {}) {
  let points: Point[] = [];
  const pointer = { x: 0, y: 0, inside: false };

  return {
    /** The pointer is over the surface, at this position. */
    move(x: number, y: number) {
      pointer.x = x;
      pointer.y = y;
      pointer.inside = true;
    },
    /** The pointer has left; the trail fades out on its own. */
    leave() {
      pointer.inside = false;
    },
    /** True while anything is left to draw. */
    get alive() {
      return pointer.inside || points.length > 0;
    },
    /**
     * Ages the trail by `dt` seconds and adds the pointer's position. `spacing`
     * is the largest gap left between points on a fast move, in the caller's
     * units, so a flick reads as a stroke rather than a row of beads.
     */
    step(dt: number, spacing: number) {
      for (const p of points) p.life -= dt / life;
      points = points.filter((p) => p.life > 0);
      if (!pointer.inside) return;
      const last = points[points.length - 1];
      if (last) {
        const gap = Math.hypot(pointer.x - last.x, pointer.y - last.y);
        const fill = Math.min(12, Math.floor(gap / Math.max(spacing, 1)));
        for (let i = 1; i <= fill; i++) {
          const f = i / (fill + 1);
          points.push({
            x: last.x + (pointer.x - last.x) * f,
            y: last.y + (pointer.y - last.y) * f,
            life: last.life + (1 - last.life) * f,
          });
        }
      }
      points.push({ x: pointer.x, y: pointer.y, life: 1 });
      if (points.length > maxPoints) points = points.slice(-maxPoints);
    },
    /** How strongly the trail covers (x, y), 0–1, for a head disc of radius `reach`. */
    sample(x: number, y: number, reach: number) {
      let held = 0;
      for (const p of points) {
        const r = reach * (0.3 + 0.7 * p.life);
        const ax = Math.abs(x - p.x);
        const ay = Math.abs(y - p.y);
        if (ax > r || ay > r) continue;
        const v = p.life * p.life * smoothstep(r, r * 0.2, Math.hypot(ax, ay));
        if (v > held) held = v;
      }
      return held;
    },
  };
}
