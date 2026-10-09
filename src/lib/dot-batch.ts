/**
 * The shortest gap between redraws of an always-running dot surface: about
 * 60 fps, with slack so a 60 Hz display never drops a frame.
 */
export const MIN_FRAME_MS = 1000 / 60 - 2;

/**
 * Collects a frame's dots by colour bucket and fills each bucket as one path.
 *
 * Every dot surface redraws thousands of dots a frame. Building a fresh
 * `Path2D` per bucket per frame looked free from JavaScript, but each one
 * holds native memory the garbage collector barely sees, so a tab left open
 * grew by gigabytes until Chrome killed it ("Aw, Snap!", error code 5). This
 * keeps the dots in buffers that are reused every frame and draws them on the
 * context's own path, which allocates nothing.
 */
export function createDotBatch(colors: readonly string[]) {
  const buffers = colors.map(() => new Float32Array(3 * 1024));
  const counts = colors.map(() => 0);

  return {
    /** Adds a dot of radius `r` at (x, y) to bucket `i`. */
    add(i: number, x: number, y: number, r: number) {
      let buf = buffers[i];
      const n = counts[i];
      if (n + 3 > buf.length) {
        buf = new Float32Array(buf.length * 2);
        buf.set(buffers[i]);
        buffers[i] = buf;
      }
      buf[n] = x;
      buf[n + 1] = y;
      buf[n + 2] = r;
      counts[i] = n + 3;
    },
    /** Fills every bucket in order, then empties the batch for the next frame. */
    flush(ctx: CanvasRenderingContext2D) {
      for (let i = 0; i < colors.length; i++) {
        const buf = buffers[i];
        const n = counts[i];
        counts[i] = 0;
        if (!n) continue;
        ctx.beginPath();
        for (let k = 0; k < n; k += 3) {
          ctx.moveTo(buf[k] + buf[k + 2], buf[k + 1]);
          ctx.arc(buf[k], buf[k + 1], buf[k + 2], 0, Math.PI * 2);
        }
        ctx.fillStyle = colors[i];
        ctx.fill();
      }
    },
  };
}
