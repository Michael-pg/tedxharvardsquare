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
  Edition,
  Faq,
  HomePage,
  HouseEvent,
  MenuImages,
  Partner,
  SiteSettings,
  Slug,
  Speaker,
  SpeakerWithTalk,
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

/** GROQ drops null keys, so `alt` is coalesced to keep the `Image` contract. */
const image = (field: string) => `${field}{
  "src": asset->url,
  "alt": coalesce(alt, ""),
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`;

const imageList = (field: string) => `"${field}": coalesce(${field}[]{
  "src": asset->url,
  "alt": coalesce(alt, ""),
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}, [])`;

const editionFields = `
  "slug": slug.current, number, year, theme, themeStatement, date, venue, status,
  ticketUrl, "poster": ${image("poster")}
`;

const speakerFields = `
  "slug": slug.current, name, kind, track, title, organization, bio, credit,
  "headshot": ${image("headshot")},
  "editionSlug": edition->slug.current,
  "links": coalesce(links[]{ label, href }, []),
  order
`;

const talkFields = `
  "slug": slug.current, title, premise,
  "speakerSlug": speaker->slug.current,
  "editionSlug": edition->slug.current,
  videoUrl, "still": ${image("still")}, durationSeconds,
  "topicSlugs": coalesce(topics[]->slug.current, [])
`;

const houseEventFields = `
  "slug": slug.current, title, tagline, format, date, venue, registrationUrl,
  status, "coverImage": ${image("coverImage")}, ${imageList("gallery")},
  attendeeCount, keyQuote
`;

// —— Site ——————————————————————————————————————————————————————————————

const siteSettingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  name, tagline, description, missionStatement, url, locale,
  "social": coalesce(social[]{ label, href }, []),
  newsletterUrl, earlyAccessUrl, contactEmail
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

export async function getHomePage(): Promise<HomePage> {
  const home = await fetchContent<HomePage | null>(
    `*[_id == "homePage"][0]{ ${imageList("heroImages")} }`,
    {},
    ["homePage"],
  );
  return home ?? { heroImages: [] };
}

const menuImagesQuery = defineQuery(`*[_id == "siteSettings"][0].menuImages{
  "general": ${image("general")},
  "flagship": ${image("flagship")},
  "house": ${image("house")},
  "speakers": ${image("speakers")},
  "sponsor": ${image("sponsor")}
}`);

/**
 * Menu photography. Slots left empty in the Studio borrow from the home-page
 * hero photos so the menu is never imageless; the indexes pick the frame that
 * best suits each destination in the current hero set (violinists, the raised
 * hands, the audience, a speaker in profile, the panel by the red letters).
 */
export async function getMenuImages(): Promise<MenuImages> {
  const [chosen, home] = await Promise.all([
    fetchContent<Record<keyof MenuImages, MenuImages["general"] | null> | null>(
      menuImagesQuery,
      {},
      ["siteSettings"],
    ),
    getHomePage(),
  ]);
  const hero = home.heroImages;
  const fallback: MenuImages = {
    general: hero[3] ?? hero[0],
    flagship: hero[0],
    house: hero[5],
    speakers: hero[1],
    sponsor: hero[2],
  };
  const images: MenuImages = {};
  for (const key of Object.keys(fallback) as (keyof MenuImages)[]) {
    const value = chosen?.[key]?.src ? chosen[key] : fallback[key];
    if (value) images[key] = value;
  }
  return images;
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
      *[_type == "edition" && status != "past"] | order(number asc)[0],
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
      | order(order asc, name asc){ ${speakerFields} }`,
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

/**
 * The speaker archive: every Flagship speaker (not performers) with their talk
 * and edition year, newest edition first, then in lineup order.
 */
export async function getSpeakerArchive(): Promise<SpeakerWithTalk[]> {
  return fetchContent(
    `*[_type == "speaker" && track == "flagship" && kind == "speaker"]
      | order(edition->year desc, order asc, name asc){
        ${speakerFields},
        "editionYear": edition->year,
        "talk": *[_type == "talk" && references(^._id)][0]{
          "slug": slug.current, title, premise, videoUrl, "still": ${image("still")}
        }
      }`,
    {},
    ["speaker", "talk", "edition"],
  );
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

// —— House (year-round programming) ————————————————————————————————————

export async function getHouseEvents(
  status?: HouseEvent["status"],
): Promise<HouseEvent[]> {
  return fetchContent(
    `*[_type == "houseEvent" && (!defined($status) || status == $status)]
      | order(date desc){ ${houseEventFields} }`,
    { status: status ?? null },
    ["houseEvent"],
  );
}

export async function getHouseEvent(slug: Slug): Promise<HouseEvent | undefined> {
  const event = await fetchContent<HouseEvent | null>(
    `*[_type == "houseEvent" && slug.current == $slug][0]{ ${houseEventFields} }`,
    { slug },
    ["houseEvent"],
  );
  return event ?? undefined;
}

// —— Supporting content ————————————————————————————————————————————————

export async function getFaqs(): Promise<Faq[]> {
  return fetchContent(
    `*[_type == "faq"] | order(order asc, question asc){
      "slug": slug.current, question, answer
    }`,
    {},
    ["faq"],
  );
}

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
      "slug": slug.current, name, tier, "logo": ${image("logo")},
      "logoOnDark": ${image("logoOnDark")}, url
    }`,
    {},
    ["partner"],
  );
}
