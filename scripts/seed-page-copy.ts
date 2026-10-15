/**
 * Fills each page document under Pages in Studio with the site's current
 * wording (`src/content/page-copy.ts`), so editors start from what is live.
 *
 *   npx sanity exec scripts/seed-page-copy.ts --with-user-token
 *   npx sanity exec scripts/seed-page-copy.ts --with-user-token -- --after-deploy
 *
 * Safe to re-run: documents are created only if missing and fields are set
 * only where empty, so Studio edits are never overwritten. `--after-deploy`
 * also removes Site settings' old `missionStatement`, which moved to
 * Pages → Home → Motto; run it once the code that reads the motto is live.
 */

import { getCliClient } from "sanity/cli";
import { pageCopy } from "../src/content/page-copy";

const client = getCliClient({ apiVersion: "2026-09-01" });

async function main() {
  const site = await client.fetch<{ missionStatement?: string } | null>(
    `*[_id == "siteSettings"][0]{ missionStatement }`,
  );
  const tx = client.transaction();

  for (const [id, defaults] of Object.entries(pageCopy)) {
    if (id === "footer") {
      tx.patch("siteSettings", (p) => p.setIfMissing(defaults));
      continue;
    }
    // The motto is whatever the home page shows today, not the default.
    const values = id === "homePage" && site?.missionStatement ? { ...defaults, motto: site.missionStatement } : defaults;
    tx.createIfNotExists({ _id: id, _type: id });
    tx.patch(id, (p) => p.setIfMissing(values));
  }

  if (process.argv.includes("--after-deploy")) {
    tx.patch("siteSettings", (p) => p.unset(["missionStatement"]));
  }

  const result = await tx.commit();
  console.log(`Seeded page copy (${result.results.length} mutations).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
