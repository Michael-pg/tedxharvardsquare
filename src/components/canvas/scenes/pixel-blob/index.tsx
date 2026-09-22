"use client";

import dynamic from "next/dynamic";

/**
 * SSR boundary for the hero blob. See the convention note in CLAUDE.md —
 * consumers import this folder, never `scene.tsx`.
 */
export const PixelBlobScene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => null,
});
