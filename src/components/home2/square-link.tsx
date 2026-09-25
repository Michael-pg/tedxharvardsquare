import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * Hard-edged square button for the dot-system pages. Primary is solid white
 * and turns TEDx red on hover; secondary is an outline. External links open in
 * a new tab and point up-right.
 */
export function SquareLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: string;
  variant?: "primary" | "secondary";
}) {
  const external = isExternal(href);
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const className = `group inline-flex h-13 items-center justify-between gap-8 border px-4.5 text-body font-medium transition-colors duration-fast ${
    variant === "primary"
      ? "border-foreground bg-foreground text-background hover:border-brand hover:bg-brand hover:text-foreground"
      : "border-ink-500 bg-background text-foreground hover:border-foreground"
  }`;
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
