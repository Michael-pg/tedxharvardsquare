import type { SiteConfig } from "../../src/content/types";

/**
 * Copy seeded from the live site (tedxharvardsquare.org) as of Aug 2026.
 * Verify with the organizers before launch.
 */
export const site: SiteConfig = {
  name: "TEDxHarvardSquare",
  tagline: "Where Ideas Meet Community",
  description:
    "Cambridge's community for ideas worth spreading. A flagship stage each year, and rooms worth being in all year round.",
  url: "https://www.tedxharvardsquare.org",
  locale: "en-US",
  social: [
    // TODO: confirm handles with organizers.
    { label: "Instagram", href: "https://instagram.com/tedxharvardsquare" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/tedxharvardsquare" },
  ],
  newsletterUrl: undefined, // TODO: Substack URL from organizers.
  contactEmail: "hello@tedxharvardsquare.org", // TODO: confirm.
};

/**
 * The mission statement, kept as content rather than markup so it can move to
 * a CMS field without a code change.
 */
export const missionStatement =
  "The right idea, heard by the right person, at the right moment, can change the course of a life, a company, or a policy. We exist to create those moments — on stage, and in every room we build year-round.";
