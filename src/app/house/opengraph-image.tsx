import { ogImage, ogSize } from "@/lib/og";

export const alt = "House: TEDxHarvardSquare's year-round programming";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "House", eyebrow: "Year-round programming in Cambridge" });
}
