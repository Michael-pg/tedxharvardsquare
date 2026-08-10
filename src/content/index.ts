/**
 * The content repository — the only module components should import content from.
 *
 * Every accessor is `async` even though the current implementation is a
 * synchronous array lookup. That is deliberate: when this moves to Sanity, the
 * queries become genuinely async and *no call site has to change*. Paying the
 * `await` tax now is cheaper than rewriting every page later.
 *
 * To migrate: replace the bodies below with GROQ queries. Nothing else moves.
 */

import { editions } from "./editions";
import { communityEvents, partners, speakers, talks, team } from "./people";
import { topics } from "./topics";
import { missionStatement, site } from "./site";
import type {
  CommunityEvent,
  Edition,
  Partner,
  Slug,
  Speaker,
  Talk,
  TeamMember,
  Topic,
} from "./types";

export type * from "./types";
export { site, missionStatement };

// —— Editions ——————————————————————————————————————————————————————————

export async function getEditions(): Promise<Edition[]> {
  return [...editions].sort((a, b) => b.number - a.number);
}

export async function getEdition(slug: Slug): Promise<Edition | undefined> {
  return editions.find((edition) => edition.slug === slug);
}

/** The edition the site should lead with — the next one, or the most recent. */
export async function getCurrentEdition(): Promise<Edition | undefined> {
  const upcoming = editions
    .filter((edition) => edition.status !== "past")
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length > 0) return upcoming[0];
  return (await getEditions())[0];
}

// —— Speakers & talks ——————————————————————————————————————————————————

export async function getSpeakers(editionSlug?: Slug): Promise<Speaker[]> {
  if (!editionSlug) return speakers;
  return speakers.filter((speaker) => speaker.editionSlug === editionSlug);
}

export async function getSpeaker(slug: Slug): Promise<Speaker | undefined> {
  return speakers.find((speaker) => speaker.slug === slug);
}

export async function getTalks(editionSlug?: Slug): Promise<Talk[]> {
  if (!editionSlug) return talks;
  return talks.filter((talk) => talk.editionSlug === editionSlug);
}

export async function getTalk(slug: Slug): Promise<Talk | undefined> {
  return talks.find((talk) => talk.slug === slug);
}

// —— Year-round programming ————————————————————————————————————————————

export async function getCommunityEvents(
  status?: CommunityEvent["status"],
): Promise<CommunityEvent[]> {
  const all = [...communityEvents].sort((a, b) => a.date.localeCompare(b.date));
  if (!status) return all;
  return all.filter((event) => event.status === status);
}

export async function getCommunityEvent(
  slug: Slug,
): Promise<CommunityEvent | undefined> {
  return communityEvents.find((event) => event.slug === slug);
}

// —— Supporting content ————————————————————————————————————————————————

export async function getTopics(): Promise<Topic[]> {
  return topics;
}

export async function getTeam(): Promise<TeamMember[]> {
  return team;
}

export async function getPartners(): Promise<Partner[]> {
  return partners;
}
