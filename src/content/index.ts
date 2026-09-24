import "server-only";

/**
 * The content repository — the only module components should import content from.
 *
 * Backed by Sanity (project k0dqlqmb, edited at /studio). Each accessor is a
 * GROQ query whose projection reshapes the document into the exact type in
 * `./types`, so components never see Sanity's storage shape: references come
 * back as slugs, images as `{ src, alt, width, height }`.
 *
 * Server-only: this module pulls in the Sanity client. Client components that
 * need a value (the nav's contact email, say) receive it as a prop.
 */

import { defineQuery } from "next-sanity";
import { client } from "@/sanity/client";
import type {
  CommunityEvent,
  Edition,
  Partner,
  SiteSettings,
  Slug,
  Speaker,
  Talk,
  TeamMember,
  Topic,
} from "./types";

export type * from "./types";

/**
 * Published content is cached and refreshed at most once a minute, so a Studio
 * edit reaches the live site without a redeploy. Tags are in place for
 * on-demand revalidation from a Sanity webhook later.
 */
const REVALIDATE_SECONDS = 60;

async function fetchContent<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["sanity", ...tags] },
  });
}

// —— Shared projections ————————————————————————————————————————————————

const image = (field: string) => `${field}{
  "src": asset->url,
  alt,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`;

const editionFields = `
  "slug": slug.current, number, theme, themeStatement, date, venue, status,
  ticketUrl, "poster": ${image("poster")}
`;

const speakerFields = `
  "slug": slug.current, name, title, organization, bio,
  "headshot": ${image("headshot")},
  "editionSlug": edition->slug.current,
  links[]{ label, href }
`;

const talkFields = `
  "slug": slug.current, title, premise,
  "speakerSlug": speaker->slug.current,
  "editionSlug": edition->slug.current,
  videoUrl, durationSeconds,
  "topicSlugs": coalesce(topics[]->slug.current, [])
`;

const communityEventFields = `
  "slug": slug.current, title, description, kind, date, venue,
  registrationUrl, status
`;

// —— Site ——————————————————————————————————————————————————————————————

const siteSettingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  name, tagline, description, missionStatement, url, locale,
  "social": coalesce(social[]{ label, href }, []),
  newsletterUrl, contactEmail
}`);

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await fetchContent<SiteSettings | null>(
    siteSettingsQuery,
    {},
    ["siteSettings"],
  );
  // The whole site depends on this document; fail the build loudly rather
  // than render a page with no name or metadata.
  if (!settings) throw new Error("Sanity: siteSettings document is missing.");
  return settings;
}

// —— Editions ——————————————————————————————————————————————————————————

export async function getEditions(): Promise<Edition[]> {
  return fetchContent(
    `*[_type == "edition"] | order(number desc){ ${editionFields} }`,
    {},
    ["edition"],
  );
}

export async function getEdition(slug: Slug): Promise<Edition | undefined> {
  const edition = await fetchContent<Edition | null>(
    `*[_type == "edition" && slug.current == $slug][0]{ ${editionFields} }`,
    { slug },
    ["edition"],
  );
  return edition ?? undefined;
}

/** The edition the site should lead with — the next one, or the most recent. */
export async function getCurrentEdition(): Promise<Edition | undefined> {
  const edition = await fetchContent<Edition | null>(
    `coalesce(
      *[_type == "edition" && status != "past"] | order(date asc)[0],
      *[_type == "edition"] | order(number desc)[0]
    ){ ${editionFields} }`,
    {},
    ["edition"],
  );
  return edition ?? undefined;
}

// —— Speakers & talks ——————————————————————————————————————————————————

export async function getSpeakers(editionSlug?: Slug): Promise<Speaker[]> {
  return fetchContent(
    `*[_type == "speaker" && (!defined($editionSlug) || edition->slug.current == $editionSlug)]
      | order(name asc){ ${speakerFields} }`,
    { editionSlug: editionSlug ?? null },
    ["speaker"],
  );
}

export async function getSpeaker(slug: Slug): Promise<Speaker | undefined> {
  const speaker = await fetchContent<Speaker | null>(
    `*[_type == "speaker" && slug.current == $slug][0]{ ${speakerFields} }`,
    { slug },
    ["speaker"],
  );
  return speaker ?? undefined;
}

export async function getTalks(editionSlug?: Slug): Promise<Talk[]> {
  return fetchContent(
    `*[_type == "talk" && (!defined($editionSlug) || edition->slug.current == $editionSlug)]
      | order(title asc){ ${talkFields} }`,
    { editionSlug: editionSlug ?? null },
    ["talk"],
  );
}

export async function getTalk(slug: Slug): Promise<Talk | undefined> {
  const talk = await fetchContent<Talk | null>(
    `*[_type == "talk" && slug.current == $slug][0]{ ${talkFields} }`,
    { slug },
    ["talk"],
  );
  return talk ?? undefined;
}

// —— Year-round programming ————————————————————————————————————————————

export async function getCommunityEvents(
  status?: CommunityEvent["status"],
): Promise<CommunityEvent[]> {
  return fetchContent(
    `*[_type == "communityEvent" && (!defined($status) || status == $status)]
      | order(date asc){ ${communityEventFields} }`,
    { status: status ?? null },
    ["communityEvent"],
  );
}

export async function getCommunityEvent(
  slug: Slug,
): Promise<CommunityEvent | undefined> {
  const event = await fetchContent<CommunityEvent | null>(
    `*[_type == "communityEvent" && slug.current == $slug][0]{ ${communityEventFields} }`,
    { slug },
    ["communityEvent"],
  );
  return event ?? undefined;
}

// —— Supporting content ————————————————————————————————————————————————

export async function getTopics(): Promise<Topic[]> {
  return fetchContent(
    `*[_type == "topic"] | order(label asc){ "slug": slug.current, label }`,
    {},
    ["topic"],
  );
}

export async function getTeam(): Promise<TeamMember[]> {
  return fetchContent(
    `*[_type == "teamMember"] | order(isLicensee desc, name asc){
      "slug": slug.current, name, role, "headshot": ${image("headshot")}, isLicensee
    }`,
    {},
    ["teamMember"],
  );
}

export async function getPartners(): Promise<Partner[]> {
  return fetchContent(
    `*[_type == "partner"] | order(name asc){
      "slug": slug.current, name, tier, "logo": ${image("logo")}, url
    }`,
    {},
    ["partner"],
  );
}
