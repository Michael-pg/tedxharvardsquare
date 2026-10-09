import { HalftonePhoto } from "@/components/home/halftone-photo";
import type { Image as ImageContent } from "@/content";

/**
 * Stands in for the lineup until speakers are added to the edition in Studio:
 * four tiles printed in coarse, blurred red halftone from past portraits, so
 * the shape of a lineup is there without pretending to name anyone.
 */
export function LineupPlaceholder({ images }: { images: ImageContent[] }) {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {images.slice(0, 4).map((image) => (
        <li key={image.src} className="flex flex-col gap-4">
          <div className="overflow-hidden bg-ink-900">
            <HalftonePhoto
              image={{ ...image, alt: "" }}
              ratio={4 / 5}
              focus={image.focus ?? undefined}
              cell={9}
              blur={2.4}
              className="w-full"
            />
          </div>
          <p className="text-small text-muted">To be announced</p>
        </li>
      ))}
    </ul>
  );
}
