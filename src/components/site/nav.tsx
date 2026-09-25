"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { barNav, menuPrimary, menuSecondary } from "@/content/navigation";
import type { MenuImageKey, MenuImages } from "@/content/types";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";
type ImageKey = MenuImageKey | "general";

const CLIP_OPEN = "inset(0% 0% 0% 0%)";
/** Collapsed to the top edge — the panel and its photos wipe down from here. */
const CLIP_TOP = "inset(0% 0% 100% 0%)";

/**
 * Site header: the lockup on the left, a hard-edged box on the right with the
 * three key destinations and the menu toggle — the same square language as
 * the page buttons. The box is solid, not glass, so it reads over photos and
 * the dot field alike.
 *
 * The lockup swaps between the supplied white and black artwork depending on
 * what sits behind it. Sections opt in with `data-nav-theme="light"`; anything
 * untagged is treated as dark, which is the whole site today.
 *
 * The menu is a full-screen panel that wipes down from above: a photograph on
 * the left (swapped per link on hover), large key pages and small secondary
 * pages on the right.
 */
export function Nav({
  contactEmail,
  menuImages,
}: {
  contactEmail: string;
  menuImages: MenuImages;
}) {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");
  const [active, setActive] = useState<MenuImageKey | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const logo = useRef<HTMLAnchorElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const shownImage = useRef<ImageKey>("general");
  const stackTop = useRef(1);
  const openTimeline = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = useReducedMotion();

  const imageKeys = (Object.keys(menuImages) as ImageKey[]).filter((key) => menuImages[key]);
  const imageFor = (key: MenuImageKey | null): ImageKey =>
    key && menuImages[key] ? key : "general";
  const secondary = [...menuSecondary, { label: "Contact", href: `mailto:${contactEmail}` }];

  // Entrance: the bar drops in after the hero copy has begun to settle.
  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set(bar.current, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        bar.current,
        { autoAlpha: 0, y: -24 },
        { autoAlpha: 1, y: 0, delay: 0.6, duration: timing.duration.slow, ease: timing.ease.expo },
      );
    },
    { scope: bar, dependencies: [reducedMotion] },
  );

  // Lockup tone: sample what is under the logo's centre on scroll and resize.
  useEffect(() => {
    let frame = 0;
    const sample = () => {
      frame = 0;
      const mark = logo.current;
      if (!mark) return;
      const rect = mark.getBoundingClientRect();
      const under = document
        .elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        .find((element) => !root.current?.contains(element));
      const theme = under?.closest("[data-nav-theme]")?.getAttribute("data-nav-theme");
      setTone(theme === "light" ? "light" : "dark");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sample);
    };
    sample();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Open / close: the panel wipes down, then the photo and the links follow.
  useGSAP(
    () => {
      const panel = overlay.current;
      if (!panel) return;
      openTimeline.current?.kill();

      if (!open) {
        if (gsap.getProperty(panel, "autoAlpha") === 0 || reducedMotion) {
          gsap.set(panel, { autoAlpha: 0, clipPath: CLIP_TOP });
          return;
        }
        gsap.to(panel, {
          clipPath: CLIP_TOP,
          duration: timing.duration.base,
          ease: timing.ease.inOut,
          onComplete: () => {
            gsap.set(panel, { autoAlpha: 0 });
          },
        });
        return;
      }

      // Every opening starts from the general photo, whatever was last hovered.
      const general = media.current?.querySelector('[data-menu-image="general"]');
      if (general) gsap.set(general, { zIndex: ++stackTop.current, clipPath: CLIP_OPEN });
      shownImage.current = "general";

      if (reducedMotion) {
        gsap.set(panel, { autoAlpha: 1, clipPath: CLIP_OPEN });
        return;
      }

      const lines = panel.querySelectorAll("[data-menu-line]");
      const minor = panel.querySelectorAll("[data-menu-minor]");

      const tl = gsap.timeline();
      tl.set(panel, { autoAlpha: 1 })
        .fromTo(
          panel,
          { clipPath: CLIP_TOP },
          { clipPath: CLIP_OPEN, duration: timing.duration.base, ease: timing.ease.inOut },
        )
        .fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: timing.duration.slow,
            ease: timing.ease.expo,
            stagger: timing.stagger.base,
          },
          "-=0.25",
        )
        .fromTo(
          minor,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: timing.duration.base, stagger: timing.stagger.base },
          "<0.3",
        );
      if (media.current) {
        tl.fromTo(
          media.current,
          { clipPath: CLIP_TOP },
          { clipPath: CLIP_OPEN, duration: timing.duration.slow, ease: timing.ease.expo },
          0.35,
        );
      }
      if (general) {
        tl.fromTo(
          general.querySelector("img"),
          { scale: 1.15 },
          { scale: 1, duration: timing.duration.slow * 1.5, ease: timing.ease.expo },
          0.35,
        );
      }
      openTimeline.current = tl;
    },
    { dependencies: [open, reducedMotion] },
  );

  // Hover swap: the link's photograph wipes down over the previous one.
  useGSAP(
    () => {
      const key = imageFor(active);
      if (key === shownImage.current || !media.current) return;
      shownImage.current = key;
      const layer = media.current.querySelector<HTMLElement>(`[data-menu-image="${key}"]`);
      if (!layer) return;

      // Each new photo stacks above the last, so the wipe always reveals
      // over whatever is currently showing.
      gsap.set(layer, { zIndex: ++stackTop.current });

      if (reducedMotion) {
        gsap.set(layer, { clipPath: CLIP_OPEN });
        return;
      }
      gsap.fromTo(
        layer,
        { clipPath: CLIP_TOP },
        { clipPath: CLIP_OPEN, duration: timing.duration.base, ease: timing.ease.expo, overwrite: true },
      );
      gsap.fromTo(
        layer.querySelector("img"),
        { scale: 1.12 },
        { scale: 1, duration: timing.duration.slow, ease: timing.ease.expo, overwrite: true },
      );
    },
    { dependencies: [active, reducedMotion] },
  );

  // While open: Escape closes, the page behind is inert and cannot scroll, and
  // focus moves into the menu — then returns to the toggle on close.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActive(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const outside = [...document.body.children].filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && !element.contains(root.current) && !element.inert,
    );
    outside.forEach((element) => (element.inert = true));
    // The panel itself takes focus, not its first link — focusing a link would
    // count as hovering it and swap the photo before anyone has pointed at it.
    overlay.current?.focus({ preventScroll: true });
    const toggleButton = toggle.current;

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      outside.forEach((element) => (element.inert = false));
      toggleButton?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setActive(null);
  };
  // The menu panel is always dark, so it overrides whatever the page shows.
  const onLight = !open && tone === "light";

  return (
    <div ref={root}>
      <header
        ref={bar}
        data-animate
        className="pointer-events-none fixed inset-x-0 top-5 z-50 flex items-center justify-between px-6 md:top-6"
      >
        {/*
          Official lockup — white on dark, black on light. PNGs stand in until
          an SVG exists; the 2072px source keeps them sharp on 3x screens.
        */}
        <Link
          ref={logo}
          href="/"
          onClick={close}
          className="pointer-events-auto relative block shrink-0"
          aria-label="TEDxHarvardSquare home"
        >
          <Image
            src="/brand/tedx-harvard-square-white.png"
            alt=""
            width={2072}
            height={701}
            priority
            className={cn(
              "h-10 w-auto transition-opacity duration-300 md:h-12",
              onLight ? "opacity-0" : "opacity-100",
            )}
          />
          <Image
            src="/brand/tedx-harvard-square-black.png"
            alt=""
            width={2072}
            height={700}
            className={cn(
              "absolute inset-0 h-10 w-auto transition-opacity duration-300 md:h-12",
              onLight ? "opacity-100" : "opacity-0",
            )}
          />
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "pointer-events-auto flex h-11 items-stretch border transition-colors duration-300",
            // With the menu open the box dissolves, leaving only the close button.
            open
              ? "border-transparent bg-transparent"
              : onLight
                ? "border-ink-200 bg-ink-50"
                : "border-ink-600 bg-background",
          )}
        >
          <ul
            inert={open}
            className={cn(
              "hidden items-stretch transition-opacity duration-300 md:flex",
              open && "opacity-0",
            )}
          >
            {barNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-full items-center px-4.5 text-small transition-colors duration-200",
                    onLight
                      ? "text-ink-800 hover:bg-ink-100 hover:text-ink-950"
                      : "text-ink-200 hover:bg-ink-800 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            ref={toggle}
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "grid w-11 place-items-center transition-colors duration-200",
              // A rule divides it from the links; alone (phones, menu open) it needs none.
              !open && "md:border-l",
              onLight
                ? "border-ink-200 text-ink-950 hover:bg-ink-950 hover:text-ink-50"
                : "border-ink-600 text-foreground hover:bg-foreground hover:text-background",
            )}
          >
            {open ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
          </button>
        </nav>
      </header>

      <div
        ref={overlay}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        tabIndex={-1}
        className="invisible fixed inset-0 z-40 bg-ink-950 outline-none"
      >
        <div className="flex h-full flex-col gap-10 px-6 pt-28 pb-10 md:grid md:grid-cols-2 md:gap-12 md:pt-36 md:pb-16 lg:gap-24">
          {/* A short band on phones, the full left column from md up. */}
          <div
            ref={media}
            className="relative aspect-video shrink-0 overflow-hidden bg-ink-900 md:aspect-auto"
          >
            {imageKeys.map((key) => {
              const image = menuImages[key]!;
              return (
                <div
                  key={key}
                  data-menu-image={key}
                  className="absolute inset-0"
                  style={{ zIndex: key === "general" ? 1 : 0 }}
                >
                  <Image
                    src={image.src}
                    alt={key === "general" ? image.alt : ""}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:justify-center">
            <ul onMouseLeave={() => setActive(null)}>
              {menuPrimary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    onMouseEnter={() => setActive(item.image)}
                    onFocus={() => setActive(item.image)}
                    onBlur={() => setActive(null)}
                    className="block overflow-hidden pb-2"
                  >
                    <span
                      data-menu-line
                      className={cn(
                        "block text-display font-medium transition-colors duration-300",
                        active === null && "text-ink-200",
                        active === item.image && "text-foreground",
                        active !== null && active !== item.image && "text-muted",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-4 md:mt-16">
              {secondary.map((item) => (
                <li key={item.href} data-menu-minor>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="text-heading font-medium text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
