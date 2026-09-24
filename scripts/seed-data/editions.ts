import type { Edition, Venue } from "../../src/content/types";

/** TODO: confirm the venue with organizers — the current site does not state it. */
const tbdVenue: Venue = {
  name: "Venue TBA",
  addressLine: "",
  city: "Cambridge",
  state: "MA",
};

export const editions: Edition[] = [
  {
    slug: "edition-4-against-entropy",
    number: 4,
    year: 2027,
    theme: "Against Entropy",
    themeStatement:
      "Everything tends toward disorder. Ideas are how we push back.", // TODO: replace with the organizers' real theme statement.
    date: "2027-02-01", // TODO: exact date — the site says only "Feb 2027".
    venue: tbdVenue,
    status: "announced",
  },
  // TODO: backfill editions 1–3 from the organizers' archive.
];
