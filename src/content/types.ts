/**
 * Content model for TEDxHarvardSquare.
 *
 * These types are the contract between content and UI. Components import from
 * `@/content` (the repository in `index.ts`), never from the raw data files —
 * so the storage layer can move to a CMS without touching a single component.
 */

export type Slug = string;

export type Image = {
  src: string;
  /** Required. Empty string only for genuinely decorative images. */
  alt: string;
  width?: number;
  height?: number;
};

/** A yearly flagship conference. */
export type Edition = {
  slug: Slug;
  /** Sequential number as the org counts them — "Edition 4". */
  number: number;
  /** The year-defining theme, e.g. "Against Entropy". */
  theme: string;
  /** One-paragraph framing of what the theme asks of the audience. */
  themeStatement: string;
  date: string; // ISO 8601
  venue: Venue;
  status: "upcoming" | "past" | "announced";
  ticketUrl?: string;
  poster?: Image;
};

export type Venue = {
  name: string;
  addressLine: string;
  city: string;
  state: string;
  /** Used for map / geo work; optional until confirmed. */
  coordinates?: { lat: number; lng: number };
};

export type Speaker = {
  slug: Slug;
  name: string;
  /** Professional title, e.g. "Neuroscientist". */
  title: string;
  organization?: string;
  bio: string;
  headshot?: Image;
  editionSlug: Slug;
  links?: { label: string; href: string }[];
};

export type Talk = {
  slug: Slug;
  title: string;
  /** The one-sentence idea worth spreading. */
  premise: string;
  speakerSlug: Slug;
  editionSlug: Slug;
  /** Canonical TED.com or YouTube URL. Absent until the talk is published. */
  videoUrl?: string;
  durationSeconds?: number;
  topicSlugs: Slug[];
};

/** The recurring subject areas the org programs against. */
export type Topic = {
  slug: Slug;
  label: string;
};

/**
 * Year-round programming — salons, meetups, workshops. This is the part of the
 * org that is not the flagship conference, and it deserves equal structure.
 */
export type CommunityEvent = {
  slug: Slug;
  title: string;
  description: string;
  kind: "salon" | "workshop" | "meetup" | "screening" | "volunteer";
  date: string; // ISO 8601
  venue: Venue;
  registrationUrl?: string;
  status: "upcoming" | "past";
};

export type TeamMember = {
  slug: Slug;
  name: string;
  role: string;
  headshot?: Image;
  /** Organizers are licence-holders; the distinction matters to TED. */
  isLicensee?: boolean;
};

export type Partner = {
  slug: Slug;
  name: string;
  tier: "presenting" | "supporting" | "community" | "in-kind";
  logo?: Image;
  url?: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  social: { label: string; href: string }[];
  newsletterUrl?: string;
  contactEmail: string;
};
