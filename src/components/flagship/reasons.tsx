import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { FlagshipPageCopy, Image as ImageContent } from "@/content";

/**
 * "Why attend": each reason as a row, a 4:3 photo beside its
 * title and a sentence or two. Rows, not cards; the photo carries the colour.
 * A reason without its own photo borrows one from `fallbacks`, in order.
 */
export function Reasons({ reasons, fallbacks }: { reasons: FlagshipPageCopy["reasons"]; fallbacks: ImageContent[] }) {
  return (
    <ol className="flex flex-col gap-12 md:gap-16">
      {reasons.map((reason, i) => {
        const image = reason.image?.src ? reason.image : fallbacks[i % Math.max(fallbacks.length, 1)];
        const focus = image?.focus ?? { x: 0.5, y: 0.5 };
        return (
          <Reveal key={reason.title} as="li" className="grid grid-cols-4 items-start gap-x-6 gap-y-5 md:grid-cols-7">
            {image && (
              <div className="relative col-span-4 aspect-4/3 overflow-hidden bg-ink-200 md:col-span-3">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 100vw"
                  style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
                  className="object-cover grayscale"
                />
              </div>
            )}
            <div className="col-span-4 flex flex-col gap-3 md:col-span-4 md:pt-2">
              <h3 className="text-heading font-medium text-balance">{reason.title}</h3>
              {reason.body && <p className="max-w-md text-body text-ink-600">{reason.body}</p>}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
