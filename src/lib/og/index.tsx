import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The share card every page's `opengraph-image.tsx` renders: the lockup, a
 * line of Figtree, and the home page's red halftone rising from the lower
 * right. The type is set from static TTFs kept beside this file, because the
 * image renderer cannot read the WOFF2 that `next/font` serves the site.
 */

export const ogSize = { width: 1200, height: 630 };

const BRAND = "#eb0028";
const INK_950 = "#08080a";
const INK_50 = "#f7f7f9";
const INK_400 = "#85858f";

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};
/** Stable per-cell random in [0, 1), the same hash as the dot field. */
const hash = (i: number, j: number, k: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * The halftone as an SVG: dot size carries the gradient, ordered and red at
 * the core, loosening into grey strays at the edge.
 */
function halftone() {
  const { width, height } = ogSize;
  const cell = 14;
  const centre = { x: width + 60, y: height + 80 };
  const reach = 700;
  const dots: string[] = [];
  for (let j = 0; j * cell < height + cell; j++) {
    for (let i = 0; i * cell < width + cell; i++) {
      const x = i * cell + cell / 2;
      const y = j * cell + cell / 2;
      const d = Math.hypot(x - centre.x, y - centre.y) / reach + (hash(i, j, 1) - 0.5) * 0.12;
      const mass = 1 - smoothstep(0.35, 1, d);
      if (mass > 0.08) {
        dots.push(`<circle cx="${x}" cy="${y}" r="${(mass * cell * 0.46).toFixed(2)}" fill="${BRAND}"/>`);
      } else if (d < 1.25 && hash(i, j, 2) > 0.82) {
        const dx = (hash(i, j, 3) - 0.5) * cell;
        const dy = (hash(i, j, 4) - 0.5) * cell;
        dots.push(`<circle cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r="1.4" fill="${INK_400}" fill-opacity="0.5"/>`);
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${dots.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function ogImage({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const [bold, medium, logo] = await Promise.all([
    // Literal paths, so the deploy traces just these three files.
    readFile(join(process.cwd(), "src/lib/og/Figtree-Bold.ttf")),
    readFile(join(process.cwd(), "src/lib/og/Figtree-Medium.ttf")),
    readFile(join(process.cwd(), "public/brand/tedx-harvard-square-white-trim.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: INK_950,
          fontFamily: "Figtree",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not the DOM */}
        <img src={halftone()} width={ogSize.width} height={ogSize.height} style={{ position: "absolute", top: 0, left: 0 }} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={250} height={70} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          {eyebrow && (
            <div style={{ fontSize: 30, fontWeight: 500, color: INK_400, marginBottom: 20 }}>{eyebrow}</div>
          )}
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: INK_50 }}>
            {title}
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Figtree", data: bold, weight: 700, style: "normal" },
        { name: "Figtree", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
