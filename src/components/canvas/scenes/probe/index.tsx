"use client";

import dynamic from "next/dynamic";

/**
 * SSR boundary for the probe scene.
 *
 * CONVENTION — every 3D scene is a folder under `scenes/` with two files:
 *
 *   scene.tsx   the R3F content, default-exported
 *   index.tsx   this file: `dynamic(() => import("./scene"), { ssr: false })`
 *
 * Consumers import the folder, never `scene.tsx`. That keeps three.js out of
 * the server render and out of the initial client bundle — it is roughly 600kb
 * that must not block first paint. Passing R3F children in as JSX from a
 * statically-imported module would defeat this, which is why each scene owns
 * its own contents rather than accepting `children`.
 */
export const ProbeScene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => null,
});
