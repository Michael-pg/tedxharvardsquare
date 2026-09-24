/**
 * Content model for TEDxHarvardSquare.
 *
 * These types are the contract between content and UI. Components import from
 * `@/content` (the repository in `index.ts`), never from Sanity directly — so
 * the storage shape can change without touching a single component.
 *
 * Fields are optional wherever the historical record is genuinely incomplete
 * (early editions, migrated Webflow entries). Components must handle absence
 * rather than the content layer inventing a value.
 */

export type Slug = string;

export type Image = {
  src: string;
  /** Required. Empty string only for genuinely decorative images. */
  alt: string;
  width?: number;
  height?: number;
};

export type Link = { label: string; href: string };

/** A yearly flagship conference. */
export type Edition = {
  slug: Slug;
  /** Sequential number as the org counts them — "Edition 4". */
  number: number;
  /** Calendar year the edition took place. Always known, unlike the exact date. */
  year: number;
  /** The year-defining theme, e.g. "Against Entropy". */
  theme?: string;
  /** One-paragraph framing of what the theme asks of the audience. */
  themeStatement?: string;
  /** ISO 8601 date. Absent when only the month or year is on record. */
  date?: string;
  venue?: Venue;
  status: "upcoming" | "past" | "announced";
  ticketUrl?: string;
  poster?: Image;
};

export type Venue = {
  name: string;
  addressLine?: string;
  city: string;
  state: string;
  /** Used for map / geo work; optional until confirmed. */
  coordinates?: { lat: number; lng: number };
};

/** Which programme a person appeared in. */
export type Track = "flagship" | "house";

export type Speaker = {
  slug: Slug;
  name: string;
  /** Speakers give talks; performers appear on the programme without one. */
  kind: "speaker" | "performer";
  track: Track;
  /** Professional title, e.g. "Neuroscientist". */
  title?: string;
  bio?: string;
  /** Performer credit line, e.g. "Accompanied by Julian Oliver". */
  credit?: string;
  headshot?: Image;
  /** Flagship appearances belong to an edition; House appearances may not. */
  editionSlug?: Slug;
  links: Link[];
  /** Manual position within an edition's lineup. Lower sorts first. */
  order?: number;
};

export type Talk = {
  slug: Slug;
  title: string;
  /** The one-sentence idea worth spreading. */
  premise?: string;
  speakerSlug: Slug;
  editionSlug?: Slug;
  /** Canonical TED.com or YouTube URL. Absent until the talk is published. */
  videoUrl?: string;
  durationSeconds?: number;
  topicSlugs: Slug[];
};

/** A speaker as the archive shows them: person, talk, and edition together. */
export type SpeakerWithTalk = Speaker & {
  talk?: Pick<Talk, "slug" | "title" | "premise" | "videoUrl">;
  editionYear?: number;
};

/** The recurring subject areas the org programs against. */
export type Topic = {
  slug: Slug;
  label: string;
};

/**
 * House — the year-round programming: salons, dinners, AMAs, workshops. This
 * is the part of the org that is not the flagship conference, and it deserves
 * equal structure. Formats mirror the org's own taxonomy from Webflow.
 */
export type HouseEvent = {
  slug: Slug;
  title: string;
  /** One line, shown on cards. */
  tagline?: string;
  format:
    | "mixer"
    | "founder-dinner"
    | "ama"
    | "salon"
    | "hackathon"
    | "workshop"
    | "other";
  date: string; // ISO 8601
  venue?: Venue;
  registrationUrl?: string;
  status: "upcoming" | "past";
  coverImage?: Image;
  gallery: Image[];
  attendeeCount?: number;
  keyQuote?: string;
};

export type Faq = {
  slug: Slug;
  question: string;
  answer: string;
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
  tier?: "presenting" | "supporting" | "community" | "in-kind";
  logo?: Image;
  /** Single-colour version for the dark site background. */
  logoOnDark?: Image;
  url?: string;
};

/** Editorial content for the home page. */
export type HomePage = {
  /** The frames that fly through the hero. The choreography is timed for six. */
  heroImages: Image[];
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  social: Link[];
  newsletterUrl?: string;
  contactEmail: string;
};

/** Everything the site-wide chrome needs, as stored in the Studio. */
export type SiteSettings = SiteConfig & {
  missionStatement: string;
};
