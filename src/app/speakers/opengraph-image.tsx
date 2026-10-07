import { ogImage, ogSize } from "@/lib/og";

export const alt = "Speakers who have taken the TEDxHarvardSquare stage";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "Speakers", eyebrow: "Talks from the TEDxHarvardSquare stage" });
}
