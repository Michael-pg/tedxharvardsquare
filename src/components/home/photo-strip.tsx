"use client";

import { useRef } from "react";
import { gsap, useGSAP, Observer, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Image as ImageContent } from "@/content";
import { cn } from "@/lib/utils";
import { PixelPhoto } from "./pixel-photo";

/**
 * The event photography as one long strip that drifts sideways while the page
 * scrolls past it — the original hero's "photos floating in", without taking
 * over the screen or locking the scroll. Heights alternate so the strip reads
 * as a contact sheet laid out by hand rather than a carousel.
 *
 * It can also be grabbed and pulled: the drag adds an offset on top of the
 * scroll drift, released with a little momentum. On touch, only sideways
 * swipes grab it, so vertical swipes still scroll the page.
 *
 * Under reduced motion the strip stays put and scrolls sideways by hand, and
 * dragging moves it directly with no momentum.
 */
export function PhotoStrip({ images }: { images: ImageContent[] }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = section.current;
      const row = track.current;
      if (!element || !row) return;

      // Reduced motion: the strip is natively scrollable; a mouse drag just moves it.
      if (reducedMotion) {
        const drag = Observer.create({
          target: element,
          type: "pointer",
          dragMinimum: 3,
          onDrag: (self) => {
            // Touch already scrolls it natively.
            if ((self.event as PointerEvent).pointerType !== "mouse") return;
            element.scrollLeft -= self.deltaX;
          },
        });
        return () => drag.kill();
      }

      const state = { scroll: 0, drag: 0 };
      const range = () => Math.max(0, row.scrollWidth - element.clientWidth);
      // Keep the combined position inside the strip, whatever the scroll does.
      const clampDrag = () => {
        state.drag = gsap.utils.clamp(-range() - state.scroll, -state.scroll, state.drag);
      };
      const setX = gsap.quickSetter(row, "x", "px");
      const render = () => {
        clampDrag();
        setX(state.scroll + state.drag);
      };

      gsap.to(state, {
        scroll: () => -range(),
        ease: "none",
        onUpdate: render,
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      const drag = Observer.create({
        target: element,
        type: "pointer,touch",
        lockAxis: true,
        dragMinimum: 3,
        onPress: () => {
          gsap.killTweensOf(state, "drag");
        },
        onDrag: (self) => {
          if (self.axis !== "x") return;
          state.drag += self.deltaX;
          render();
        },
        onDragEnd: (self) => {
          if (self.axis !== "x") return;
          gsap.to(state, {
            drag: state.drag + self.velocityX * 0.3,
            duration: timing.duration.slow,
            ease: timing.ease.expo,
            onUpdate: render,
          });
        },
      });
      return () => drag.kill();
    },
    { scope: section, dependencies: [reducedMotion, images.length] },
  );

  return (
    <div
      ref={section}
      // Photos are not draggable files here; the whole strip is the handle.
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        "cursor-grab select-none active:cursor-grabbing",
        reducedMotion ? "overflow-x-auto" : "touch-pan-y overflow-hidden",
      )}
    >
      <div ref={track} className="flex w-max items-start gap-6 px-6">
        {images.map((image, i) => {
          const ratio = image.width && image.height ? image.width / image.height : 3 / 2;
          return (
            <PixelPhoto
              key={image.src}
              image={image}
              sizes="(min-width: 768px) 40vw, 80vw"
              className={i % 2 ? "mt-24 h-56 md:mt-40 md:h-80" : "h-72 md:h-112"}
              // Width follows the photo's own shape; only the height is set.
              style={{ aspectRatio: String(ratio) }}
            />
          );
        })}
      </div>
    </div>
  );
}
