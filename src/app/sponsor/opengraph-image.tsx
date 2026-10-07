import { ogImage, ogSize } from "@/lib/og";

export const alt = "Sponsor TEDxHarvardSquare";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "Sponsor", eyebrow: "Partner with TEDxHarvardSquare" });
}
