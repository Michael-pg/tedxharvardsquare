import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/content";
import { footerNav, legalNav, type NavItem } from "@/content/navigation";
import { FooterGlow } from "./footer-glow";
import { BackToTop, CambridgeTime } from "./footer-meta";

const isExternal = (href: string) => /^https?:\/\//.test(href);

function FooterLink({ label, href }: NavItem) {
  const className =
    "group inline-flex items-center gap-1 text-body text-ink-300 transition-colors duration-fast hover:text-foreground";
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-muted transition-transform duration-fast ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
        />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function Column({ title, links }: { title: string; links: NavItem[] }) {
  if (links.length === 0) return null;
  return (
    <div className="lg:col-span-2">
      <h3 className="mb-5 text-label text-muted uppercase">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Site footer: a sign-up call to action, the link columns, a meta row, and the
 * lockup set full-width over a red halftone glow — the hero's pixel field
 * returning at the bottom of the page.
 *
 * Everything editable (contact, social, newsletter, early-access list, mission)
 * comes from site settings; the page structure comes from `navigation.ts`.
 */
export async function SiteFooter() {
  const site = await getSiteSettings();

  const follow: NavItem[] = [
    ...site.social,
    ...(site.newsletterUrl ? [{ label: "Substack", href: site.newsletterUrl }] : []),
  ];
  const columns = [
    footerNav[0],
    {
      ...footerNav[1],
      links: [...footerNav[1].links, { label: "Contact", href: `mailto:${site.contactEmail}` }],
    },
    { title: "Follow", links: follow },
    { title: "Legal", links: legalNav },
  ];

  return (
    <footer className="relative z-10 overflow-hidden border-t border-rule bg-background">
      <div className="px-6 pt-24 md:pt-40">
        {/* Call to action */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-6 flex items-center gap-3 text-label text-foreground uppercase">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
              Stay in the room
            </p>
            <h2 className="text-display font-medium text-balance">
              Hear it first, all year round.
            </h2>
            <p className="mt-6 max-w-xl text-lead text-ink-300">
              First word on Flagship tickets, House events, and new talks.
            </p>
          </div>
          {(site.earlyAccessUrl || site.newsletterUrl) && (
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              {site.earlyAccessUrl && (
                <a
                  href={site.earlyAccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-body font-medium text-background transition-colors duration-fast hover:bg-ink-200"
                >
                  Get early access
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-fast ease-out-quart group-hover:translate-x-0.5"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              {site.newsletterUrl && (
                <a
                  href={site.newsletterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-ink-600 px-6 py-3.5 text-body font-medium text-foreground transition-colors duration-fast hover:border-ink-400"
                >
                  Subscribe on Substack
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-fast ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <nav
          aria-label="Footer"
          className="mt-24 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-rule pt-12 md:mt-32 md:grid-cols-4 lg:grid-cols-12"
        >
          <p className="col-span-2 max-w-sm text-small text-ink-300 md:col-span-4 lg:col-span-4">
            {site.missionStatement}
          </p>
          {columns.map((column) => (
            <Column key={column.title} {...column} />
          ))}
        </nav>

        {/* Meta */}
        <div className="mt-20 flex flex-col gap-4 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
          <CambridgeTime />
          <BackToTop />
          <p className="text-small text-muted">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
        {/* TEDx licence terms require this line, in this wording. */}
        <p className="mt-4 text-small text-muted">
          This independent{" "}
          <a
            href="https://www.ted.com/about/programs-initiatives/tedx-program"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rule underline-offset-4 transition-colors duration-fast hover:text-foreground hover:decoration-brand"
          >
            TEDx
          </a>{" "}
          event is operated under license from TED.
        </p>
      </div>

      {/* Lockup over the glow */}
      <div className="relative mt-8 px-6 pt-16 pb-24 md:mt-12 md:pt-20 md:pb-40">
        <FooterGlow />
        <Image
          src="/brand/tedx-harvard-square-white-trim.png"
          alt={site.name}
          width={1842}
          height={516}
          sizes="100vw"
          className="relative h-auto w-full"
        />
      </div>
    </footer>
  );
}
