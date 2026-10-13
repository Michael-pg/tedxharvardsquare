import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { FlagshipPageCopy } from "@/content";

/**
 * The case for coming, straight after the theme: each reason a photograph
 * with its line beneath, side by side, numbered. Every photo is cropped to the
 * same 4:3 and sits square to the grid, so the three read as one row rather
 * than a scatter. Three reads best; a reason without a photo keeps its text.
 */
export function WhyCome({ reasons }: { reasons: FlagshipPageCopy["reasons"] }) {
  return (
    <Reveal as="ol" stagger className="grid grid-cols-4 gap-x-6 gap-y-14 md:grid-cols-12">
      {reasons.map((reason, i) => {
        const focus = reason.image?.focus ?? { x: 0.5, y: 0.5 };
        return (
          <li key={reason.title} className="col-span-4 flex flex-col gap-6">
            {reason.image && (
              <div className="relative aspect-4/3 overflow-hidden bg-ink-900">
                <Image
                  src={reason.image.src}
                  alt={reason.image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex gap-x-4">
              <span aria-hidden className="text-heading font-medium text-muted tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-heading font-medium text-balance">{reason.title}</h3>
                {reason.body && <p className="mt-3 max-w-md text-body text-ink-300">{reason.body}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}
