"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, timing } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export type Stat = { value: string; label: string };

const COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const WHOLE_NUMBER = /^\d{1,3}(,\d{3})*$|^\d+$/;

/**
 * The figures, set big on hairlines: no boxes, the numbers carry it. Whole
 * numbers count up as they arrive; anything else ("Nearly 400") simply
 * rises in. Under reduced motion, or without JS, every figure is final.
 */
export function StatsBand({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const reducedMotion = useReducedMotion();
  const shown = stats.slice(0, 4);

  useGSAP(
    () => {
      if (reducedMotion) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-stat]");
      gsap.set(items, { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((item, i) => {
            const delay = i * 0.12;
            gsap.to(item, { autoAlpha: 1, y: 0, duration: timing.duration.base, ease: timing.ease.out, delay });
            const figure = item.querySelector<HTMLElement>("[data-figure]");
            const final = figure?.textContent ?? "";
            if (!figure || !WHOLE_NUMBER.test(final)) return;
            const end = Number(final.replace(/,/g, ""));
            const counter = { n: 0 };
            figure.textContent = "0";
            gsap.to(counter, {
              n: end,
              duration: 1.6,
              ease: timing.ease.expo,
              delay,
              onUpdate: () => {
                figure.textContent = Math.round(counter.n).toLocaleString("en-US");
              },
              onComplete: () => {
                figure.textContent = final;
              },
            });
          });
        },
      });
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <dl ref={ref} className={cn("grid grid-cols-2 gap-x-6 gap-y-16", COLUMNS[shown.length])}>
      {shown.map((stat) => (
        <div key={stat.label} data-stat className="flex flex-col-reverse justify-end gap-3 border-t border-rule pt-5">
          <dt className="max-w-48 text-body text-muted">{stat.label}</dt>
          <dd data-figure className={cn("text-display font-medium text-balance", shown.length <= 3 && "md:text-statement")}>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
