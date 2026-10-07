import { getCurrentEdition } from "@/content";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "TEDxHarvardSquare Flagship, the annual conference";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const edition = await getCurrentEdition();
  return ogImage({
    title: edition?.theme ?? "Flagship",
    eyebrow: edition ? `Flagship ${edition.year}` : "The annual conference",
  });
}
