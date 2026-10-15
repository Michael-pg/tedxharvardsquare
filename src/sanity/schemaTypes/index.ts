import {
  edition,
  faq,
  houseEvent,
  partner,
  siteSettings,
  speaker,
  talk,
  teamMember,
  topic,
} from "./documents";
import { accessibleImage, link, venue } from "./objects";
import { pageTypes } from "./pages";

export const schemaTypes = [
  siteSettings,
  ...pageTypes,
  edition,
  speaker,
  talk,
  houseEvent,
  faq,
  topic,
  teamMember,
  partner,
  venue,
  link,
  accessibleImage,
];

/** Document types that exist exactly once and are edited in place. */
export const singletonTypes = new Set(["siteSettings", ...pageTypes.map((type) => type.name)]);
