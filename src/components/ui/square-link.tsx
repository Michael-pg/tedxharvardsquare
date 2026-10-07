import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * Hard-edged square button, the site's button shape. Primary is solid white
 * and turns TEDx red on hover; secondary is an outline. External links open in
 * a new tab and point up-right. `tone="light"` is for the light paper
 * sections: the same shapes, inverted.
 */
export function SquareLink({
  href,
  children,
  variant = "primary",
  tone = "dark",
}: {
  href: string;
  children: string;
  variant?: "primary" | "secondary";
  tone?: "dark" | "light";
}) {
  const external = isExternal(href);
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const variants = {
    dark: {
      primary: "border-foreground bg-foreground text-background hover:border-brand hover:bg-brand hover:text-foreground",
      secondary: "border-ink-500 bg-background text-foreground hover:border-foreground",
    },
    light: {
      primary: "border-ink-950 bg-ink-950 text-ink-50 hover:border-brand hover:bg-brand",
      secondary: "border-ink-400 bg-ink-50 text-ink-950 hover:border-ink-950",
    },
  };
  const className = `group inline-flex h-13 items-center justify-between gap-8 border px-4.5 text-body font-medium transition-colors duration-fast ${variants[tone][variant]}`;
  const content = (
    <>
      {children}
      <Arrow
        aria-hidden="true"
        className="size-4 transition-transform duration-fast ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
