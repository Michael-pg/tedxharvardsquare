/**
 * The embedded Sanity Studio. The optional catch-all hands every /studio/*
 * path to the Studio's own client-side router.
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
