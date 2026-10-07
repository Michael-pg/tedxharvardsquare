import { ogImage, ogSize } from "@/lib/og";

export const alt = "Partners of TEDxHarvardSquare";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "Partners", eyebrow: "The partners who make it possible" });
}
