# Progress log

Where the build stands, what was decided, and what's next. **Start every new
Claude session by reading this file** (it is not auto-loaded, to keep token
use down). Add a dated entry at the end of each session; keep entries short.

---

## Standing rules

- **Webflow stays live.** `tedxharvardsquare.org` remains on Webflow until the
  owner explicitly says to switch. Do not touch DNS, domains, redirects on the
  live site, or Webflow content. Build on the Vercel site only.
- Every change goes through a branch + PR; the owner approves merges.
- Design rules live in `DESIGN.md`; project/code rules in `CLAUDE.md`.

---

## Current state (2026-09-24)

**Live preview:** https://tedxharvardsquare.vercel.app — Studio at `/studio`.

| Area | State |
| --- | --- |
| Pages | Home (3D hero with real photos, topics), `/home2` (new dot-system home, preview only, PR #13), `/speakers`, `/faq`, `/privacy`, `/terms`, `/code-of-conduct`, `/accessibility`, `/studio` |
| Content | All in Sanity — see CLAUDE.md "Content status" |
| Nav | Bar: Flagship · House · Speakers + menu. Menu: Flagship · House · Speakers · Sponsor, then About · FAQ · Contact. Only Speakers/FAQ exist yet |

### Infrastructure

- **GitHub:** `Michael-pg/tedxharvardsquare`, `main` is production.
- **Vercel:** one project, `tedxharvardsquare` (duplicate deleted). Framework
  pinned in `vercel.json`. Every PR gets a preview (behind Vercel login).
- **Sanity:** project `k0dqlqmb`, dataset `production`. CORS allows
  `localhost:3000` and the Vercel production URL (credentials). Wildcard for
  preview URLs deliberately **not** added (security).
- **MCP servers** (`.mcp.json`): next-devtools, vercel, sanity, motion. Vercel
  and Sanity need a one-time OAuth sign-in per machine.
- **Webflow MCP** (claude.ai connector): read access to the old site. A full
  CMS + page snapshot is in the gitignored `research/webflow-export/`.

### This machine's setup (MacBook, user `mpg`)

Node 24 LTS and `gh` live in `~/.local/bin` (on PATH via `~/.zshrc`). Git is
logged in through `gh`. Vercel and Sanity CLIs are logged in and the repo is
linked (`.vercel/`, `.env.local` — both gitignored). GSAP skills are installed
user-wide in `~/.claude/skills/`.

---

## Decisions

| Date | Decision |
| --- | --- |
| 2026-09-24 | Sanity Studio embedded at `/studio` (one repo, one deploy) rather than standalone. |
| 2026-09-24 | Year-round programme is called **House**, never "Community". |
| 2026-09-24 | **Figtree** is the site typeface; **Helvetica Neue** is for the logo only. |
| 2026-09-24 | Only the 3 live Webflow sponsors migrated; archived sponsors/FAQs left behind. |
| 2026-09-24 | The 2027 edition is in **Boston**. Feb 21 2026 edition: Arrow Street Arts. The earlier edition: April 2025. |
| 2026-09-25 | **Edition numbering corrected by the owner:** 1 = April 2025, 2 = Feb 21 2026, 3 = Against Entropy (2027). Owner corrected the `number` fields in Studio the same day. |
| 2026-09-25 | Edition 3 venue is **Arrow Street Arts** (owner). Supersedes "Boston". |
| 2026-09-24 | Performers are stored as speakers (`kind: performer`) and hidden from `/speakers`, matching Webflow. |

---

## Open questions (need the owner/organizers)

- Logo: no SVG exists; the Webflow PNGs (`public/brand/`) stand in. Swap for SVG if one is ever made.
- TEDx rules vs. the Partner **"Presenting"** tier.
- Edition 3 (2027) exact date; Edition 1 date and theme; Edition 2 theme.
- Job titles for the ten 2025 speakers (blank in Webflow too).
- FAQ "How do I get there?" still describes Arrow Street Arts (2026 venue).
- Arrow Street Arts white logo was inferred from Webflow's "Mask group-2" — confirm in Studio.
- Webflow `/schedule` page (Feb 2026 run-of-show): archive or drop?

---

## Known issues

1. **Small red text fails WCAG AA** (brand red on black is 4.35:1, needs 4.5).
   Eyebrow labels on `/speakers`, `/faq`, the hero edition label, and the
   year in the speaker dialog; red hover on talk titles and FAQ questions.
   Fix per `DESIGN.md` §3 (red mark beside foreground text). **Do first.**
2. Speaker bios render only inside the dialog — not indexable. Per-speaker
   pages (`/speakers/[slug]`) fix this.

---

## Next up (suggested order)

1. Fix the red-text contrast issue (small, visible to every visitor).
3. **Flagship page** — build it as the reference-quality "golden page";
   everything after reuses its parts.
4. House page, Sponsor page (sponsor pitch: audience, packages, past partners).
5. Per-speaker pages + JSON-LD (Event, Person) + per-page OG images.
6. CI: GitHub Actions running lint, typecheck, build on every PR.
7. Performance and accessibility pass (Lighthouse ≥ 90, WCAG 2.2 AA); Vercel Speed Insights.
8. Before any domain switch: Webflow redirect map, check Webflow custom code (analytics), then DNS — **only when the owner says so**.

---

## Session log

### 2026-09-24 — setup, CMS, Webflow migration

Set up the machine (git, gh, Node), cloned the repo, connected GitHub, Vercel,
Sanity. PRs: #1 Next 16.3.6 security update · #2 MCP connections · #3 fix
production 404 (framework preset) · #4 Sanity CMS + embedded Studio · #5
silence R3F `THREE.Clock` warning · #6 GSAP skills install docs · #7 Webflow
migration (Speakers archive, FAQ, House, home photography). Deleted duplicate
Vercel project. Imported Webflow CMS into Sanity. Wrote `DESIGN.md` and this log. Nav now uses the official lockup (PNG stand-in).

**Token notes:** the costliest things were screenshots, reading whole web
pages, and very large tool results (the Webflow guide). One task per chat;
say "skip screenshots" when visual checks aren't needed.

### 2026-09-25 — header and menu

Split the header: larger lockup on the left (swaps white/black over
`data-nav-theme="light"` sections), glass pill on the right. New full-screen
menu with a wipe-down entrance and per-link hover photos. Dropped Past
Editions, Volunteer, Apply to Speak. Menu photos are a new optional Studio
field (Site settings → Menu images); until filled they borrow the home hero
photos.

### 2026-09-25 — Studio labels for marketing editors

Every field editors touch now says where it shows on the site. Site settings
is split into tabs (Home page, Menu, Contact & social, Search & sharing);
`tagline` is labelled "Home page headline". Labels only — no field names or
data changed. CORS already allows `https://tedxharvardsquare.vercel.app` with
credentials, so invited editors can sign in at `/studio`. Invite them at
sanity.io/manage → Members with the Editor role. Follow-up: Presentation tool
(click-to-edit on the live page) needs draft mode + stega in `@/content`.

### 2026-09-25 — footer and legal pages

Site footer on every page: sign-up CTA (Mailchimp early-access list +
Substack), link columns, live Cambridge clock, back to top, the TEDx licence
line, and a full-width lockup over a red halftone glow (2D canvas, not WebGL).
New Studio field **Early-access list link** (Contact & social); set to the
2026 Mailchimp list. Trimmed white lockup added as
`public/brand/tedx-harvard-square-white-trim.png`. Generic `/privacy` and
`/terms` pages (static, in code) — have someone with legal knowledge review
before the domain switch. Also `/code-of-conduct` and `/accessibility`
(footer column "Policies"). Accessibility page promises a reply within five
business days (owner confirmed). Volunteer and
Apply to speak stay out of the footer for now. Follow-up: move policy copy into
Sanity if organizers need to edit it.

### 2026-09-25 — home 2 brainstorm

Owner wants the footer's red halftone dots to become the site-wide language
("SaaS/code vibe for an ideas conference"), with a left-aligned hero, tried out
on a separate `/home2`. Plan and open questions in `docs/HOME2-PLAN.md`. No
code yet; first step is extracting the footer's dot renderer into a shared
engine.

### 2026-09-25 — home 2 (dot system), built

Seven rounds of sketches with the owner (`docs/HOME2-PLAN.md` §8–13), then built
at `/home2` (noindex, not linked): a full-width one-line headline, one fixed dot
field for the page (an ordered red mass whose edge frays into grey dust, growing
toward the footer), a scroll-lit motto, a sideways-drifting B&W photo strip with
a red pixel hover trail, the dot field drawing the "04" edition number, and past
speakers as a hover-portrait name index. New type tokens: `text-mega`,
`text-statement`, `text-numeral`. Content here can't reach Sanity, so it was
checked against local mock content, lint and typecheck only; check the Vercel
preview with real photos. Open: House naming/weight (conflicts with CLAUDE.md and
DESIGN.md), nav buttons to square, mono labels, and replacing `/`.

### 2026-09-25 — home 2 QA and wrap-up

PR #13 (draft) carries `/home2`; the Vercel preview built green with real Sanity
content. QA fixes: the speaker name list was one unbreakable line (JSX drops
whitespace between elements), which caused a huge horizontal scroll. Names now
wrap, and are smaller on phones. Checked for no horizontal overflow at 375,
1280 and 1920px, and no console errors (against local mock content, since
Sanity is unreachable from the cloud sandbox).

**Edition numbers corrected by the owner:** 1 = April 2025, 2 = Feb 21 2026,
3 = Against Entropy (2027). Docs are updated; **the three `number` fields in
Studio still say 2/3/4 and must be edited** (the slugs `edition-2-2025`,
`edition-3-2026`, `edition-4-against-entropy` also carry the old numbers;
nothing links to them yet, so renaming is optional).

**Next up for home 2:** review the preview with real photos; decide House vs
"Beyond the stage"; square-button nav; mono labels or not; then swap `/home2`
into `/` and delete the old hero and `pixel-blob` scene.

Follow-up: the speaker name index is removed from `/home2` at the owner's request
(don't showcase past speakers on home); a single "Watch the talks" link to
`/speakers` replaces it.

The owner has since corrected the edition `number` fields in Studio (1/2/3).

### 2026-09-25 — home 2 edits

Motto now shows the whole mission statement: the first sentence as before, the
second ("We exist to create those moments…") set smaller beneath it. Hero drops
the red-square edition label; the edition line (number · venue · year) sits
quietly in muted text beside the buttons. Past speakers is a section again:
a count headline, the "Watch the talks" link, and a 4×2 contact sheet of the
most recent portraits (B&W, red pixel hover). New Partners row with the three
sponsor logos (`logoOnDark`, links out). Checked against local mock content
(Sanity unreachable from the cloud sandbox): no overflow at 390 and 1440px, no
console errors.

**Studio edits the owner needs to make** (can't be done from the sandbox):
Against Entropy → Venue: name "Arrow Street Arts", city "Cambridge"; and
optionally drop the em dash from Site settings → Mission statement.

Follow-up the same day: the header's glass pill is now a hard-edged solid box
(links + a square menu toggle split by a rule), matching the square buttons.
It is site-wide, so it shows on `/` too. `/home2` drops every eyebrow label
(red square + small caps): the motto stands alone, "Flagship · Edition 03" is
a row in the When/Where table, the speaker count headline says "past
speakers", and the partners row opens with a plain line of text. Still to
match: eyebrows on `/speakers`, `/faq`, the footer ("Stay in the room") and the
footer's rounded button.
