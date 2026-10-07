import { ogImage, ogSize } from "@/lib/og";

export const alt = "TEDxHarvardSquare FAQ";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "FAQ", eyebrow: "Tickets, venue, accessibility and more" });
}
