"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { gsap, useGSAP, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { heroMotion } from "@/lib/hero-motion";
import { PixelBlobScene } from "@/components/canvas/scenes/pixel-blob";
import { GlassButton } from "@/components/ui/glass-button";
import type { Image as ImageContent } from "@/content";

type HeroProps = {
  tagline: string;
  missionStatement: string;
  images: ImageContent[];
  editionLabel?: string;
};

/**
 * The hero is one pinned scroll sequence, scrubbed across three viewport
 * heights:
 *
 *   0.00–0.16  the tagline dissolves
 *   0.05–0.60  the blob expands to fill the screen
 *   0.10–0.66  images dolly from far Z toward the viewer and float out above
 *   0.64–0.80  the mission statement forms
 *   0.86–1.00  everything fades out and the pin releases
 *
 * The blob is not animated here. GSAP writes scalar progress into `heroMotion`
 * and the shader reads it in its own render loop — crossing that boundary with
 * React state would mean a re-render every frame.
 */
export function Hero({
  tagline,
  missionStatement,
  images,
  editionLabel,
}: HeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Pointer drives the blob directly, bypassing React entirely.
  useGSAP(
    () => {
      if (reducedMotion) return;
      const onMove = (event: PointerEvent) => {
        heroMotion.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        heroMotion.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
        heroMotion.pointerActive = true;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { dependencies: [reducedMotion] },
  );

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      const title = element.querySelector("[data-hero-title]");
      const mission = element.querySelector("[data-hero-mission]");
      const supporting = element.querySelectorAll("[data-hero-supporting]");
      const flyers = Array.from(
        element.querySelectorAll<HTMLElement>("[data-hero-image]"),
      );

      // Reduced motion gets the resting composition and no pin — a scroll-
      // jacked, three-screen-long sequence is exactly what that setting asks
      // us not to do. The mission statement is shown too, since otherwise the
      // content would simply be unreachable.
      if (reducedMotion) {
        gsap.set([title, mission, ...supporting], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
        gsap.set(flyers, { autoAlpha: 0 });
        heroMotion.progress = 0;
        return;
      }

      // Entrance, before any scrolling happens. The pixels move first and the
      // copy arrives on top of a scene that is already alive — hence the
      // deliberate delay rather than everything fading up together.
      heroMotion.intro = 0;

      gsap
        .timeline()
        // The orb bursts outward past its resting size and settles. `back.out`
        // overshoots above 1, which is what produces the spurt.
        .to(heroMotion, {
          intro: 1,
          duration: 1.9,
          ease: "back.out(2.2)",
        })
        .fromTo(
          title,
          { autoAlpha: 0, y: 44, filter: "blur(14px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.3,
            ease: timing.ease.expo,
          },
          // Absolute position on the timeline: the headline lands while the
          // orb is still settling, not after it has come to rest.
          0.95,
        )
        .fromTo(
          supporting,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, stagger: timing.stagger.base, duration: 0.9 },
          1.35,
        );

      gsap.set(flyers, { autoAlpha: 0 });
      gsap.set(mission, { autoAlpha: 0 });

      // Scroll velocity bends the images. One setter per element rather than
      // one across the set — quickTo is built for a single target, and the
      // per-element functions let each image lag slightly differently.
      const bend = flyers.map((flyer) => ({
        skew: gsap.quickTo(flyer, "skewY", {
          duration: 0.55,
          ease: timing.ease.out,
        }),
        tilt: gsap.quickTo(flyer, "rotationX", {
          duration: 0.7,
          ease: timing.ease.out,
        }),
      }));

      const scrub = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "+=420%",
          pin: true,
          // A slightly lazy scrub is most of the "flowy" quality — the timeline
          // eases toward the scroll position rather than being nailed to it.
          scrub: 1.4,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Velocity is in px/s and swings wide; this maps it to a few
            // degrees of flex that settles back to flat when scrolling stops.
            // Kept modest: this is a transient flex while scrolling, and it has
            // to settle back to perfectly square when the scroll stops.
            const velocity = gsap.utils.clamp(-9, 9, self.getVelocity() / 220);
            // Uniform across the set: the frames are meant to read as identical
            // objects on one conveyor, so they flex together. Per-image lag
            // would reintroduce exactly the raggedness we just removed.
            bend.forEach((b) => {
              b.skew(velocity);
              b.tilt(velocity * 0.85);
            });
          },
        },
      });

      // 1 — the blob starts expanding immediately, while the tagline holds. The
      // idea begins multiplying before the words leave, so the two overlap
      // rather than handing off.
      //
      // `immediateRender: false` on every fromTo in this timeline is load-
      // bearing. GSAP applies a fromTo's start values the moment the tween is
      // built, so without it the mission tween below would set its target to
      // autoAlpha 0 during setup and win against the intro.
      scrub
        .to(heroMotion, { progress: 1, duration: 0.6, ease: "power1.inOut" }, 0)
        // 2 — the copy leaves first, travelling up and clear of the viewport.
        // It is fully gone by 0.14, well before the first frame appears at
        // 0.22, so the two phases never share the screen.
        .fromTo(
          [title, ...supporting],
          { autoAlpha: 1, y: 0, filter: "blur(0px)" },
          {
            autoAlpha: 0,
            y: -460,
            filter: "blur(10px)",
            duration: 0.14,
            ease: "power2.in",
            immediateRender: false,
          },
          0,
        );

      // 3 — the images. Each starts far back and small, dollies toward the
      // viewer along the bottom-right → top-left diagonal, and floats up and
      // out past the camera. Rotation is kept small: the motion should read as
      // depth and drift, not as tumbling.
      // One conveyor. Every image is the same size and rides the identical line
      // through 3D space, one after another — a row of frames funnelling up out
      // of the bottom right.
      //
      // Three constraints hold this together, and all three are load-bearing:
      //
      // 1. Identical `scale` on both ends. Apparent growth comes purely from
      //    `z` travelling toward the camera through the container's perspective,
      //    so every frame is genuinely the same size at the same point on the
      //    path. Varying scale per image would break that.
      // 2. `ease: "none"`. Constant speed is what keeps the spacing constant.
      //    Any in/out easing makes the images bunch toward the middle of the
      //    path, which is precisely where they would overlap.
      // 3. GAP / TRAVEL sets the spatial separation as a fraction of the path.
      //    At 0.085 / 0.19 each frame sits ~45% of the path behind the one
      //    ahead — comfortably more than one frame length, so they never touch.
      // FIRST leaves a deliberate beat of empty screen after the copy exits at
      // 0.14 — the pause is the point, not dead time.
      const FIRST = 0.2;
      const GAP = 0.072;
      const TRAVEL = 0.2;

      flyers.forEach((flyer, index) => {
        const offset = FIRST + index * GAP;

        scrub.fromTo(
          flyer,
          {
            xPercent: 150,
            yPercent: 200,
            z: -1900,
            scale: 1,
            // No rotation, at any point. The reference is emphatic: the
            // photographs stay square to the frame and let depth carry the
            // motion. Tilting them reads as a scrapbook.
            rotation: 0,
          },
          {
            xPercent: -150,
            yPercent: -250,
            z: 240,
            scale: 1,
            rotation: 0,
            duration: TRAVEL,
            ease: "none",
          },
          offset,
        );

        // Short fades at the very ends of the path, so frames appear far away
        // and leave once past the camera rather than blinking out mid-flight.
        scrub
          .fromTo(
            flyer,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: TRAVEL * 0.14 },
            offset,
          )
          .to(flyer, { autoAlpha: 0, duration: TRAVEL * 0.16 }, offset + TRAVEL * 0.84);
      });

      // 4 — the mission statement forms once the images have cleared.
      scrub.fromTo(
        mission,
        { autoAlpha: 0, y: 44, filter: "blur(12px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.08,
          // A touch of overshoot so it settles rather than simply arriving.
          ease: "back.out(1.4)",
          immediateRender: false,
        },
        0.78,
      );

      // 5 — release: the ideas dissipate in place. `progress` is left at 1 so
      // the field fades at full spread instead of collapsing back to a point.
      //
      // The statement holds fully lit from 0.86 to 0.96 — about 40vh of scroll
      // at this pin length. Any tighter and it is on screen too briefly to
      // actually read, which was true of the first pass at these numbers.
      scrub
        .to(mission, { autoAlpha: 0, y: -34, duration: 0.04 }, 0.96)
        .to(heroMotion, { opacity: 0, duration: 0.08, ease: "power1.in" }, 0.92);
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <div ref={root} className="relative h-svh overflow-hidden">
      {/* The blob sits behind everything and bleeds to black at its edges. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <PixelBlobScene />
      </div>

      {/*
        Perspective lives on the container so the images share one vanishing
        point — per-element `transformPerspective` would give each its own and
        destroy the sense that they occupy the same space.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
      >
        {images.map((image) => (
          <div
            key={image.src}
            data-hero-image
            // 70vw is the *layout* width, not the rendered one. Mid-path the
            // frame sits at roughly z -830 against a 1400px perspective, so it
            // renders at ~0.63 of this — landing in the 40–50vw target as it
            // crosses centre screen. Verified by measurement, not by eye.
            className="absolute top-1/2 left-1/2 w-[70vw] max-w-[1000px] min-w-[300px] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 800}
              height={image.height ?? 1000}
              className="h-auto w-full shadow-[0_40px_120px_-24px_rgba(0,0,0,0.95)]"
              priority={false}
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        {editionLabel ? (
          <p
            data-hero-supporting
            data-animate
            className="mb-10 text-label text-brand uppercase"
          >
            {editionLabel}
          </p>
        ) : null}

        <h1
          data-hero-title
          data-animate
          className="max-w-5xl text-hero font-medium text-balance"
        >
          {tagline}
        </h1>

        <div data-hero-supporting data-animate className="mt-12">
          <GlassButton href="/flagship" size="large">
            View Flagship
            <ArrowUpRight
              size={20}
              strokeWidth={2}
              className="transition-transform duration-300 ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </GlassButton>
        </div>

        {/*
          The mission statement is absolutely positioned so it can occupy the
          same optical centre as the tagline without the two reserving stacked
          space in the flow.
        */}
        <p
          data-hero-mission
          data-animate
          className="absolute inset-x-6 mx-auto max-w-4xl text-title font-medium text-balance md:inset-x-12"
        >
          {missionStatement}
        </p>
      </div>
    </div>
  );
}
