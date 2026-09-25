import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

/**
 * Shared shell for the legal pages: the standard inner-page header, then a
 * prose column. Sections are plain `<section>`s with an `h2`; the `.prose`
 * rules in globals.css style them.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** Human-readable date the text last changed, e.g. "September 25, 2026". */
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="px-6 pt-40 pb-32 md:pt-56">
        <header className="mb-20 max-w-4xl md:mb-28">
          <p className="mb-6 text-label text-muted uppercase">Updated {updated}</p>
          <h1 className="text-display font-medium text-balance">{title}</h1>
          <div className="mt-8 max-w-3xl text-lead text-ink-300">{intro}</div>
        </header>
        <div className="prose max-w-3xl">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
