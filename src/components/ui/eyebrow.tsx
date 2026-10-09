import type { ReactNode } from "react";

/**
 * A section's eyebrow: small uppercase text beside a red dot. The red is a
 * mark, not the text — red at label size fails contrast (DESIGN.md §3).
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-label text-muted uppercase ${className ?? ""}`}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brand" />
      {children}
    </p>
  );
}
