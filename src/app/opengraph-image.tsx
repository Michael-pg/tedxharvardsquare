import { getSiteSettings } from "@/content";
import { ogImage, ogSize } from "@/lib/og";

/** The default share card: every page without its own falls back to this one. */
export const alt = "TEDxHarvardSquare, Cambridge's community for ideas worth spreading";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const site = await getSiteSettings();
  return ogImage({ title: site.tagline, eyebrow: "Cambridge, Massachusetts" });
}
