export type NavItem = { label: string; href: string };

/**
 * The four items that earn a place in the glass bar. Everything else lives
 * behind the hamburger — the bar is a wayfinding device, not a sitemap.
 *
 * "Community" carries the year-round programming, which is deliberately given
 * equal billing with the flagship rather than being buried under About.
 */
export const primaryNav: NavItem[] = [
  { label: "Flagship", href: "/flagship" },
  { label: "Speakers", href: "/speakers" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

/** Revealed by the hamburger, alongside the primary items on small screens. */
export const secondaryNav: NavItem[] = [
  { label: "Past Editions", href: "/editions" },
  { label: "Partners", href: "/partners" },
  { label: "Apply to Speak", href: "/apply" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Contact", href: "/contact" },
];
