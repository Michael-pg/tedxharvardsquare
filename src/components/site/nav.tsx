"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { primaryNav, secondaryNav } from "@/content/navigation";
import { cn } from "@/lib/utils";

/**
 * Floating centred glass bar: wordmark, four primary destinations, hamburger.
 *
 * The bar sits over the WebGL layer, so it is glass rather than solid — the
 * blob should read through it. The overlay it opens is deliberately opaque,
 * because menu legibility beats the effect once the menu is actually open.
 */
export function Nav({ contactEmail }: { contactEmail: string }) {
  const [open, setOpen] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

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

  useGSAP(
    () => {
      const element = overlay.current;
      if (!element) return;

      if (!open) {
        gsap.set(element, { autoAlpha: 0, pointerEvents: "none" });
        return;
      }

      gsap.set(element, { pointerEvents: "auto" });
      const tl = gsap.timeline();
      tl.to(element, {
        autoAlpha: 1,
        duration: reducedMotion ? 0 : timing.duration.fast,
      });
      if (!reducedMotion) {
        tl.from(
          element.querySelectorAll("[data-menu-item]"),
          {
            y: 28,
            autoAlpha: 0,
            stagger: timing.stagger.base,
            duration: timing.duration.base,
            ease: timing.ease.expo,
          },
          "-=0.1",
        );
      }
    },
    { dependencies: [open, reducedMotion] },
  );

  // Escape closes; body scroll locks while the menu owns the screen.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header
        ref={bar}
        data-animate
        className="fixed inset-x-0 top-5 z-50 flex justify-center px-4"
      >
        <nav
          aria-label="Primary"
          className={cn(
            "flex items-center gap-1 rounded-full p-1.5 pl-5",
            "border border-white/12 bg-black/25 backdrop-blur-2xl",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_8px_40px_-12px_rgba(0,0,0,0.8)]",
          )}
        >
          <Link
            href="/"
            className="mr-3 text-label font-semibold tracking-[0.14em] text-foreground uppercase"
          >
            TEDx<span className="text-brand">HarvardSquare</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-full px-4 py-2 text-small text-ink-200",
                    "transition-colors duration-200 hover:bg-white/10 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "ml-1 grid size-10 place-items-center rounded-full",
              "border border-white/12 bg-white/8",
              "transition-colors duration-200 hover:bg-white/16",
            )}
          >
            {open ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
          </button>
        </nav>
      </header>

      <div
        ref={overlay}
        id="site-menu"
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col justify-center bg-ink-950/95 px-6 backdrop-blur-2xl md:px-12"
      >
        <ul className="mx-auto w-full max-w-3xl">
          {[...primaryNav, ...secondaryNav].map((item) => (
            <li key={item.href} data-menu-item>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block border-b border-rule py-4 text-title font-medium",
                  "transition-colors duration-200 hover:text-brand",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p
          data-menu-item
          className="mx-auto mt-10 w-full max-w-3xl text-small text-muted"
        >
          {contactEmail}
        </p>
      </div>
    </>
  );
}
