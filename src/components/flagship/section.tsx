import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A page section on black or on light paper. Paper sections are opaque, so
 * they cover the page's fixed dot field, and they tell the header to switch
 * to its dark lockup while it is over them. Use paper for calm, informative
 * blocks; keep black for the theme and the big moments.
 */
export function Section({
  tone = "dark",
  className,
  ...props
}: ComponentProps<"section"> & { tone?: "dark" | "paper" }) {
  return (
    <section
      data-nav-theme={tone === "paper" ? "light" : undefined}
      className={cn("relative", tone === "paper" && "bg-ink-50 text-ink-950", className)}
      {...props}
    />
  );
}
