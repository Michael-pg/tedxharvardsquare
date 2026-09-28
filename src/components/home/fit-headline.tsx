"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * A headline set on one line across the full width of its container, like a
 * masthead. From `md` up the font size is scaled so the words run exactly
 * edge to edge; on phones one line would be unreadably small, so the text
 * falls back to `text-mega` and wraps.
 */
export function FitHeadline({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const heading = ref.current;
    const container = heading?.parentElement;
    if (!heading || !container) return;
    const wide = window.matchMedia("(min-width: 768px)");

    const fit = () => {
      if (!wide.matches) {
        heading.style.fontSize = "";
        return;
      }
      // Measure at a known size, then scale linearly: type width is
      // proportional to font size.
      heading.style.fontSize = "100px";
      const range = document.createRange();
      range.selectNodeContents(heading);
      const textWidth = range.getBoundingClientRect().width;
      if (textWidth > 0) heading.style.fontSize = `${(100 * container.clientWidth) / textWidth * 0.995}px`;
    };

    fit();
    document.fonts.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    wide.addEventListener("change", fit);
    return () => {
      observer.disconnect();
      wide.removeEventListener("change", fit);
    };
  }, [children]);

  return (
    <h1 ref={ref} data-dot-clear className={`text-mega font-medium md:whitespace-nowrap ${className ?? ""}`}>
      {children}
    </h1>
  );
}
