/**
 * One-time migration of the Webflow CMS into Sanity.
 *
 *   npx sanity exec scripts/import-webflow.ts --with-user-token                    # dry run
 *   IMPORT_COMMIT=1 npx sanity exec scripts/import-webflow.ts --with-user-token    # write
 *
 * Reads the snapshot taken through the Webflow MCP on 2026-09-24, which lives
 * in the gitignored `research/webflow-export/` (the export is internal
 * context; this script is the record of how it was mapped).
 *
 * Idempotent: document IDs derive from Webflow item IDs, writes use
 * createOrReplace, and Sanity deduplicates uploaded images by content hash.
 * Re-running overwrites Studio edits to these documents, so run it before
 * editors start work, not after.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const COMMIT = process.env.IMPORT_COMMIT === "1";
const EXPORT_DIR = "research/webflow-export";
const client = getCliClient({ apiVersion: "2026-09-01" });

// —— Webflow snapshot shapes ——————————————————————————————————————————————

type WebflowImage = { fileId: string; url: string; alt: string | null } | null;
type WebflowItem<F> = { id: string; isArchived: boolean; isDraft: boolean; fieldData: F };
type Snapshot = {
  speakers: {
    items: WebflowItem<{
      name: string;
      slug: string;
      "profile-picture"?: WebflowImage;
      "job-title"?: string | null;
      speech?: string | null;
      bio2?: string | null;
      year?: number | null;
      youtube?: string | null;
      linkedin?: string | null;
      type?: string | null;
      track?: string | null;
    }>[];
  };
  faq: { items: WebflowItem<{ name: string; slug: string; answer?: string | null }>[] };
  sponsors: { items: WebflowItem<{ name: string; slug: string; image?: WebflowImage }>[] };
};
type HomeImage = { url: string; file: string };

const snapshot: Snapshot = JSON.parse(readFileSync(`${EXPORT_DIR}/cms-2026-09-24.json`, "utf8"));
const homeManifest: HomeImage[] = JSON.parse(
  readFileSync(`${EXPORT_DIR}/home-images/manifest.json`, "utf8"),
);

// Webflow option IDs → our values (from the collection schemas).
const PERFORMER = "b6b0143bff4d2f57aa6786125456c20c";
const HOUSE_TRACK = "78d5560c40fac6868d0ec9228234ffe0";

/** Lineup order exactly as the live /speakers page renders it (2026, then 2025). */
const SPEAKER_ORDER = [
  "Jeff Harmon", "Shawna Young", "Andrea Choe", "Ceren Koca", "John Cordier",
  "Anya Dillard", "Carlos Gascón Alvarez", "Alexis Abramson", "Marinela Profi",
  "Martine Bertrand", "Jayna Swan", "Phil Neil",
  "Hanan Nagi", "Jon Cobb", "Dr. Jaya Sarin Pradhan", "Mariam Khayretdinova",
  "Jackson Kerchis", "Dr. Stefano Sinicropi", "Isabella Mandis",
  "Vivien Puppa Kocsis", "Gustav Luna", "Alissa M. Kleinnijenhuis",
];

/** FAQ order exactly as the live /faq page renders it. */
const FAQ_ORDER = [
  "What is TedxHarvardSQ?",
  "What is the theme of this event?",
  "What is this event for?",
  "How can I request accessibility/accommodations/special needs?",
  "How do I get there? Where do I park?",
  "What is the bag policy?",
  "Is water available on site? Can I bring a water bottle?",
  "What should I wear?",
  "Will I be recorded or photographed?",
  "Will talk videos be available later? Where?",
  "Is this appropriate for children?",
  "How does this event work? How many talks/sessions will there be? Will there be breaks?",
  "How can I stay connected after the event?",
];

/**
 * Home-page photography, with alt text written from the images themselves
 * (Webflow's own alt text was missing or described the wrong photo). The
 * first six are the hero sequence — all landscape, which the hero frames at
 * a fixed width; the rest go to the photo library.
 */
const HOME_HERO: Array<[fileFragment: string, alt: string]> = [
  ["DSC_2039", "A speaker in a wheelchair raises his hand on the TEDxHarvardSquare stage as a packed audience raises theirs in response."],
  ["DSC_2507", "A speaker in profile makes a point with one raised finger against a dark stage."],
  ["DSC_1827", "Four panelists in conversation on the TEDxHarvardSquare stage, beside the red TEDx letters."],
  ["musicians-performing", "A violinist and a guitarist perform on the TEDx stage in front of a full house."],
  ["speaker-closeup", "A speaker in a grey overshirt gestures with both hands mid-talk."],
  ["audience-watching", "Audience members in red theater seats listen intently."],
];
const HOME_LIBRARY: Array<[fileFragment: string, alt: string]> = [
  ["DSC_1311", "A speaker stands in the red circle on the TEDxHarvardSquare stage, beneath a projected painting of dark figures on a pink-orange ground."],
  ["IMG_9825", "A speaker in a black suit addresses a seated audience in a gallery-style room, with the Harvard Square wordmark and a projected slide behind him."],
  ["efdb8782", "A five-person panel on startup resilience in climate tech speaks to an audience in a bright conference room."],
];

/** White logo variants from the home page's sponsor strip, keyed by sponsor name. */
const LOGO_ON_DARK: Record<string, string> = {
  VentureCafe: "VentureCafe-White",
  CamelBack: "Cameback-White",
  // Inferred: the only other logo in the strip of three live sponsors.
  "Arrow Street Arts": "Mask group-2",
};

// —— Helpers ————————————————————————————————————————————————————————————

const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);

const slug = (current: string) => ({ _type: "slug", current });
const ref = (id: string) => ({ _type: "reference", _ref: id });
const keyed = <T extends object>(items: T[]) => items.map((item, i) => ({ _key: `k${i}`, ...item }));

/** youtu.be/ID?si=… and watch?v=ID&… both become the canonical watch URL. */
function canonicalYouTube(url: string): string {
  const parsed = new URL(url);
  const id = parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
  return id ? `https://www.youtube.com/watch?v=${id}` : url;
}

const tmp = mkdtempSync(join(tmpdir(), "webflow-import-"));
const uploaded = new Map<string, string>();
let uploadCount = 0;

/** Downloads from Webflow's CDN and uploads to Sanity. Returns an image field value. */
async function image(url: string, alt: string) {
  let assetId = uploaded.get(url);
  if (!assetId) {
    uploadCount++;
    if (!COMMIT) {
      assetId = `dry-run-asset-${uploadCount}`;
    } else {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
      let bytes = Buffer.from(await response.arrayBuffer());
      let filename = decodeURIComponent(url.split("/").pop() ?? "image").replace(/^[0-9a-f]{24}_/, "");
      // Sanity's pipeline does not accept AVIF uploads; macOS `sips` converts losslessly enough.
      if (filename.toLowerCase().endsWith(".avif")) {
        const source = join(tmp, "in.avif");
        const target = join(tmp, "out.jpg");
        writeFileSync(source, bytes);
        execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", source, "--out", target]);
        bytes = readFileSync(target);
        filename = filename.replace(/\.avif$/i, ".jpg");
      }
      const asset = await client.assets.upload("image", bytes, { filename });
      assetId = asset._id;
    }
    uploaded.set(url, assetId);
  }
  return { _type: "accessibleImage", asset: ref(assetId), alt };
}

// —— Build documents ————————————————————————————————————————————————————

type Doc = { _id: string; _type: string; [key: string]: unknown };

async function build(): Promise<{ docs: Doc[]; patches: Array<[string, Record<string, unknown>]> }> {
  const docs: Doc[] = [];

  // Editions 2 and 3 predate the Studio. Edition 4 exists from the seed and
  // only needs the new `year` field.
  const editionIdByYear: Record<number, string> = {
    2025: "edition-edition-2-2025",
    2026: "edition-edition-3-2026",
    2027: "edition-edition-4-against-entropy",
  };
  docs.push(
    {
      _id: editionIdByYear[2025],
      _type: "edition",
      number: 2,
      year: 2025,
      slug: slug("edition-2-2025"),
      status: "past",
      // Held in April 2025; exact date, theme, and venue not yet on record.
    },
    {
      _id: editionIdByYear[2026],
      _type: "edition",
      number: 3,
      year: 2026,
      slug: slug("edition-3-2026"),
      date: "2026-02-21",
      status: "past",
      venue: {
        _type: "venue",
        name: "Arrow Street Arts",
        addressLine: "2 Arrow St",
        city: "Cambridge",
        state: "MA",
      },
    },
  );

  // Speakers and their talks.
  const usedTalkSlugs = new Set<string>();
  for (const item of snapshot.speakers.items) {
    if (item.isArchived) continue;
    const f = item.fieldData;
    const name = f.name.trim();
    const kind = f.type === PERFORMER ? "performer" : "speaker";
    const editionId = f.year ? editionIdByYear[f.year] : undefined;
    const speakerId = `webflow-speaker-${item.id}`;
    const order = SPEAKER_ORDER.indexOf(name);

    const links = f.linkedin
      ? [{ _type: "link", label: f.linkedin.includes("linkedin.com") ? "LinkedIn" : "Website", href: f.linkedin }]
      : [];

    docs.push({
      _id: speakerId,
      _type: "speaker",
      name,
      slug: slug(f.slug),
      kind,
      track: f.track === HOUSE_TRACK ? "house" : "flagship",
      ...(editionId && { edition: ref(editionId) }),
      ...(f["job-title"]?.trim() && { title: f["job-title"].trim() }),
      ...(f.bio2?.trim() && { bio: f.bio2.trim() }),
      ...(kind === "performer" && f.speech?.trim() && { credit: f.speech.trim() }),
      ...(f["profile-picture"] && {
        headshot: await image(f["profile-picture"].url, `Portrait of ${name}`),
      }),
      links: keyed(links),
      ...(order >= 0 && { order }),
    });

    if (kind === "speaker" && f.speech?.trim()) {
      const title = f.speech.trim();
      let talkSlug = slugify(title);
      if (usedTalkSlugs.has(talkSlug)) talkSlug = `${talkSlug}-${f.slug}`;
      usedTalkSlugs.add(talkSlug);
      docs.push({
        _id: `webflow-talk-${item.id}`,
        _type: "talk",
        title,
        slug: slug(talkSlug),
        speaker: ref(speakerId),
        ...(editionId && { edition: ref(editionId) }),
        ...(f.youtube && { videoUrl: canonicalYouTube(f.youtube) }),
        topics: [],
      });
    }
  }

  // FAQ — archived items stay behind, as agreed.
  for (const item of snapshot.faq.items) {
    if (item.isArchived) continue;
    const question = item.fieldData.name.trim();
    const order = FAQ_ORDER.indexOf(question);
    docs.push({
      _id: `webflow-faq-${item.id}`,
      _type: "faq",
      question,
      slug: slug(item.fieldData.slug),
      answer: (item.fieldData.answer ?? "").trim(),
      ...(order >= 0 && { order }),
    });
  }

  // Sponsors → partners. Live ones only, as agreed; tier is not recorded in Webflow.
  const homeByFragment = (fragment: string) => {
    const match = homeManifest.find((h) => h.file.includes(fragment));
    if (!match) throw new Error(`No home image matching "${fragment}"`);
    return match;
  };
  for (const item of snapshot.sponsors.items) {
    if (item.isArchived) continue;
    const name = item.fieldData.name.trim();
    const onDark = LOGO_ON_DARK[name];
    docs.push({
      _id: `webflow-partner-${item.id}`,
      _type: "partner",
      name,
      slug: slug(item.fieldData.slug),
      ...(item.fieldData.image && { logo: await image(item.fieldData.image.url, `${name} logo`) }),
      ...(onDark && { logoOnDark: await image(homeByFragment(onDark).url, `${name} logo`) }),
    });
  }

  // Home page.
  const homeImages = async (list: Array<[string, string]>) =>
    keyed(await Promise.all(list.map(([fragment, alt]) => image(homeByFragment(fragment).url, alt))));
  docs.push({
    _id: "homePage",
    _type: "homePage",
    heroImages: await homeImages(HOME_HERO),
    photoLibrary: await homeImages(HOME_LIBRARY),
  });

  // Patches to seeded documents: fill gaps without replacing them.
  const patches: Array<[string, Record<string, unknown>]> = [
    ["edition-edition-4-against-entropy", { year: 2027 }],
    [
      "siteSettings",
      {
        // As published on the live site's footer and FAQ.
        contactEmail: "tedxharvardsqconferences@gmail.com",
        newsletterUrl: "https://tedxharvardsquare.substack.com/",
        social: keyed([
          { _type: "link", label: "Instagram", href: "https://www.instagram.com/tedxharvardsquare/" },
          { _type: "link", label: "LinkedIn", href: "https://www.linkedin.com/company/tedxharvardsquare/" },
        ]),
      },
    ],
  ];

  return { docs, patches };
}

// —— Run ————————————————————————————————————————————————————————————————

async function main() {
  const { docs, patches } = await build();

  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d._type] = (acc[d._type] ?? 0) + 1;
    return acc;
  }, {});
  console.log(COMMIT ? "Writing to Sanity:" : "DRY RUN — nothing will be written:");
  for (const [type, n] of Object.entries(counts)) console.log(`  ${type.padEnd(10)} ${n}`);
  console.log(`  images     ${uploadCount} ${COMMIT ? "uploaded" : "to upload"}`);
  for (const [id, set] of patches) console.log(`  patch      ${id}: ${Object.keys(set).join(", ")}`);

  if (!COMMIT) {
    const speakers = docs.filter((d) => d._type === "speaker");
    const noTitle = speakers.filter((d) => !d.title).map((d) => d.name);
    const noOrder = speakers.filter((d) => d.order === undefined).map((d) => d.name);
    console.log(`\n  speakers without a job title (${noTitle.length}): ${noTitle.join(", ")}`);
    console.log(`  speakers not on the live page (${noOrder.length}): ${noOrder.join(", ")}`);
    console.log(`  talks with video: ${docs.filter((d) => d._type === "talk" && d.videoUrl).length}`);
    console.log("\nRe-run with IMPORT_COMMIT=1 to write.");
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  for (const [id, set] of patches) tx.patch(id, (p) => p.set(set));
  const result = await tx.commit();
  console.log(`\nCommitted ${result.results.length} mutations.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
