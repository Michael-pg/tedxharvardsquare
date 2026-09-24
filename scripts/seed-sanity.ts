/**
 * One-time import of the local seed content into Sanity.
 *
 *   npx sanity exec scripts/seed-sanity.ts --with-user-token
 *
 * Runs as whoever is logged in to the Sanity CLI, so no API token is stored
 * anywhere. Document IDs are derived from slugs and written with
 * createOrReplace, so re-running overwrites rather than duplicates — which
 * also means it will clobber edits made in the Studio. Run it once.
 */

import { getCliClient } from "sanity/cli";
import { editions } from "./seed-data/editions";
import { missionStatement, site } from "./seed-data/site";
import { topics } from "./seed-data/topics";

const client = getCliClient({ apiVersion: "2026-09-01" });

const withKeys = <T extends object>(items: T[]) =>
  items.map((item, i) => ({ _key: `k${i}`, ...item }));

async function main() {
  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    name: site.name,
    tagline: site.tagline,
    description: site.description,
    missionStatement,
    url: site.url,
    locale: site.locale,
    social: withKeys(site.social.map((s) => ({ _type: "link", ...s }))),
    newsletterUrl: site.newsletterUrl,
    contactEmail: site.contactEmail,
  });

  for (const t of topics) {
    tx.createOrReplace({
      _id: `topic-${t.slug}`,
      _type: "topic",
      label: t.label,
      slug: { _type: "slug", current: t.slug },
    });
  }

  for (const e of editions) {
    tx.createOrReplace({
      _id: `edition-${e.slug}`,
      _type: "edition",
      number: e.number,
      theme: e.theme,
      slug: { _type: "slug", current: e.slug },
      themeStatement: e.themeStatement,
      date: e.date,
      venue: { _type: "venue", ...e.venue },
      status: e.status,
      ticketUrl: e.ticketUrl,
    });
  }

  const result = await tx.commit();
  console.log(`Seeded ${result.results.length} documents.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
