export type NavItem = { label: string; href: string };

/**
 * The four items that earn a place in the glass bar. Everything else lives
 * behind the hamburger — the bar is a wayfinding device, not a sitemap.
 *
 * "House" is the year-round programming — the org's own name for it — and is
 * deliberately given equal billing with the flagship rather than being buried
 * under About.
 */
export const primaryNav: NavItem[] = [
  { label: "Flagship", href: "/flagship" },
  { label: "Speakers", href: "/speakers" },
  { label: "House", href: "/house" },
  { label: "About", href: "/about" },
];

/** Revealed by the hamburger, alongside the primary items on small screens. */
export const secondaryNav: NavItem[] = [
  { label: "Past Editions", href: "/editions" },
  { label: "Partners", href: "/partners" },
  { label: "FAQ", href: "/faq" },
  { label: "Apply to Speak", href: "/apply" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Contact", href: "/contact" },
];
