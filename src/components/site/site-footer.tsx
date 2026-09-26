import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/content";
import { footerNav, policyNav, type NavItem } from "@/content/navigation";
import { SquareLink } from "@/components/ui/square-link";
import { FooterGlow } from "./footer-glow";
import { BackToTop, CambridgeTime } from "./footer-meta";

const isExternal = (href: string) => /^https?:\/\//.test(href);

function FooterLink({ label, href }: NavItem) {
  const className =
    "group inline-flex items-center gap-1 text-lead text-ink-300 transition-colors duration-fast hover:text-foreground";
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
    <div className="border-t border-rule pt-4 lg:col-span-2">
      <h2 className="mb-5 text-small text-muted">{title}</h2>
      <ul className="space-y-2.5">
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
 * Site footer: sign-up and link columns in one row, each hung from a hairline
 * rule so the row reads as a grid, then a meta row and the lockup over a red
 * halftone glow — the hero's pixel field returning at the bottom of the page.
 * Buttons are the site's square ones.
 *
 * Everything editable (contact, social, newsletter, early-access list)
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
    { title: "Policies", links: policyNav },
  ];

  const signUps = [
    site.earlyAccessUrl && { label: "Get early access", href: site.earlyAccessUrl, primary: true },
    site.newsletterUrl && { label: "Subscribe", href: site.newsletterUrl, primary: false },
  ].filter((link): link is { label: string; href: string; primary: boolean } => Boolean(link));

  return (
    <footer className="relative z-10 overflow-hidden bg-background">
      {/* Sign-up and links */}
      <div className="relative z-10 grid grid-cols-2 gap-x-8 gap-y-14 px-6 pt-24 md:grid-cols-4 md:pt-40 lg:grid-cols-12">
        <div className="col-span-2 border-t border-rule pt-4 md:col-span-4 lg:col-span-4 lg:pr-12">
          <h2 className="text-title font-medium">Stay in the room.</h2>
          <p className="mt-3 max-w-sm text-lead text-balance text-ink-300">
            First word on Flagship tickets, House events, and new talks.
          </p>
          {signUps.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {signUps.map((link) => (
                <SquareLink key={link.href} href={link.href} variant={link.primary ? "primary" : "secondary"}>
                  {link.label}
                </SquareLink>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Footer" className="contents">
          {columns.map((column) => (
            <Column key={column.title} {...column} />
          ))}
        </nav>
      </div>

      {/*
        The glow zone. The canvas reaches a little above its box so the
        faintest dots hint up behind the bottom of the link columns.
      */}
      <div className="relative mt-20 md:mt-28">
        <FooterGlow />

        <div className="relative flex flex-col gap-3 px-6 md:flex-row md:items-center md:justify-between">
          <CambridgeTime />
          <BackToTop />
          <p className="text-small text-muted">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
        {/* TEDx licence terms require this line, in this wording. */}
        <p className="relative mt-3 px-6 text-small text-muted">
          This independent{" "}
          <a
            href="https://www.ted.com/about/programs-initiatives/tedx-program"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-ink-600 underline-offset-4 transition-colors duration-fast hover:text-foreground hover:decoration-brand"
          >
            TEDx
          </a>{" "}
          event is operated under license from TED.
        </p>

        <div className="relative px-6 pt-16 pb-16 md:pt-24 md:pb-28">
          <Image
            src="/brand/tedx-harvard-square-white-trim.png"
            alt={site.name}
            width={1842}
            height={516}
            sizes="85vw"
            className="h-auto w-17/20"
          />
        </div>
      </div>
    </footer>
  );
}
