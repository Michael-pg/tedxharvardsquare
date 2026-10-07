import { ogImage, ogSize } from "@/lib/og";

export const alt = "About TEDxHarvardSquare";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "About", eyebrow: "An independently organized TEDx event" });
}
