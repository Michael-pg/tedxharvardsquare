import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassButtonProps = {
  children: ReactNode;
  href: string;
  className?: string;
  size?: "base" | "large";
} & Omit<ComponentProps<typeof Link>, "children" | "href" | "className">;

/**
 * The glass treatment used for anything floating over the WebGL layer.
 *
 * `backdrop-blur` only reads as glass when there is something behind it, so
 * these are intended for use over the blob — on flat background they will look
 * like a plain translucent chip, which is the correct degradation.
 */
export function GlassButton({
  children,
  href,
  className,
  size = "base",
  ...props
}: GlassButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-3 rounded-full",
        "border border-white/15 bg-white/8 backdrop-blur-xl",
        "font-medium text-foreground",
        // The inset highlight is what sells the glass — a hard light edge along
        // the top and a soft shadow beneath.
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_8px_32px_-8px_rgba(0,0,0,0.6)]",
        "transition-[background-color,border-color,transform] duration-300 ease-out-quart",
        "hover:border-white/25 hover:bg-white/14 active:scale-[0.98]",
        size === "large" ? "px-8 py-4 text-lead" : "px-6 py-3 text-body",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
