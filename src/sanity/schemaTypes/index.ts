import {
  communityEvent,
  edition,
  partner,
  siteSettings,
  speaker,
  talk,
  teamMember,
  topic,
} from "./documents";
import { accessibleImage, link, venue } from "./objects";

export const schemaTypes = [
  siteSettings,
  edition,
  speaker,
  talk,
  communityEvent,
  topic,
  teamMember,
  partner,
  venue,
  link,
  accessibleImage,
];

/** Document types that exist exactly once and are edited in place. */
export const singletonTypes = new Set(["siteSettings"]);
