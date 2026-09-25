import type { MenuImageKey } from "./types";

export type NavItem = { label: string; href: string };
export type MenuItem = NavItem & { image: MenuImageKey };

/**
 * The three destinations that earn a place in the glass bar. Everything else
 * lives behind the menu — the bar is a wayfinding device, not a sitemap.
 * Flagship and House sit side by side: the two programmes get equal billing.
 */
export const barNav: NavItem[] = [
  { label: "Flagship", href: "/flagship" },
  { label: "House", href: "/house" },
  { label: "Speakers", href: "/speakers" },
];

/**
 * The menu's large links, each with its own photograph on hover. "House" is
 * the year-round programming — the org's own name for it — and sits beside
 * Flagship with equal billing rather than being buried under About.
 */
export const menuPrimary: MenuItem[] = [
  { label: "Flagship", href: "/flagship", image: "flagship" },
  { label: "House", href: "/house", image: "house" },
  { label: "Speakers", href: "/speakers", image: "speakers" },
  { label: "Sponsor", href: "/sponsor", image: "sponsor" },
];

/** The menu's small links. Contact is added by the nav, from site settings. */
export const menuSecondary: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];
