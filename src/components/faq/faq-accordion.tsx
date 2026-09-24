"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { gsap, useGSAP, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Faq } from "@/content/types";

/**
 * FAQ accordion. Items open independently, as on the Webflow site. Answers stay
 * in the DOM when closed (height 0, `inert`), so they are server-rendered and
 * searchable, but hidden from keyboard and screen-reader focus until opened.
 */
export function FaqAccordion({ items }: { items: Faq[] }) {
  return (
    <ul className="border-t border-rule">
      {items.map((item) => (
        <FaqItem key={item.slug} item={item} />
      ))}
    </ul>
  );
}

function FaqItem({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const panelId = `faq-${item.slug}`;

  useGSAP(
    () => {
      if (!panel.current) return;
      gsap.to(panel.current, {
        height: open ? "auto" : 0,
        duration: reducedMotion ? 0 : timing.duration.base,
        ease: timing.ease.inOut,
      });
    },
    { dependencies: [open, reducedMotion] },
  );

  return (
    <li className="border-b border-rule">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-start justify-between gap-8 py-8 text-left"
        >
          <span className="text-heading font-medium transition-colors duration-300 group-hover:text-brand">
            {item.question}
          </span>
          <Plus
            aria-hidden
            className={cn(
              "mt-1 size-6 shrink-0 text-muted transition-transform duration-500 ease-out-expo",
              open && "rotate-45 text-foreground",
            )}
          />
        </button>
      </h2>
      <div
        id={panelId}
        ref={panel}
        role="region"
        aria-label={item.question}
        inert={!open}
        className="h-0 overflow-hidden"
      >
        <p className="max-w-3xl pb-8 text-body text-ink-300 whitespace-pre-line">{item.answer}</p>
      </div>
    </li>
  );
}
