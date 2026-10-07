import {
  edition,
  faq,
  homePage,
  houseEvent,
  partner,
  siteSettings,
  speaker,
  sponsorPage,
  talk,
  teamMember,
  topic,
} from "./documents";
import { accessibleImage, link, venue } from "./objects";

export const schemaTypes = [
  siteSettings,
  homePage,
  sponsorPage,
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
export const singletonTypes = new Set(["siteSettings", "homePage", "sponsorPage"]);
