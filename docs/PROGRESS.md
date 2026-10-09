# Progress log

Where the build stands, what was decided, and what's next. **Start every new
Claude session by reading this file** (it is not auto-loaded, to keep token
use down). Add a dated entry at the end of each session; keep entries short.

---

## Standing rules

- **The live domain is on Vercel** (switched 2026-10-08). `main` deploys
  straight to https://www.tedxharvardsquare.org, so every merge is public.
  DNS lives in Squarespace Domains; only the owner edits it.
- Every change goes through a branch + PR; the owner approves merges.
- Design rules live in `DESIGN.md`; project/code rules in `CLAUDE.md`.

---

## Current state (2026-10-08)

**Live:** https://www.tedxharvardsquare.org — Studio at `/studio`. The bare
domain 308s to `www`. https://tedxharvardsquare.vercel.app still works but is
noindexed.

| Area | State |
| --- | --- |
| Pages | Home (dot system), `/flagship`, `/house`, `/speakers`, `/faq`, `/about`, `/sponsor` (Partners), `/privacy`, `/terms`, `/code-of-conduct`, `/accessibility`, `/studio` |
| Content | All in Sanity — see CLAUDE.md "Content status" |
| Nav | Bar: Flagship · House · Speakers + menu. Menu: Flagship · House · Speakers · Sponsor, then About · FAQ · Contact. Every menu link now has a page |

### Infrastructure

- **GitHub:** `Michael-pg/tedxharvardsquare`, `main` is production.
- **Vercel:** one project, `tedxharvardsquare` (duplicate deleted). Framework
  pinned in `vercel.json`. Every PR gets a preview (behind Vercel login).
- **Domain:** registered at Squarespace Domains (Google Cloud nameservers).
  `A @ 216.198.79.1`, `CNAME www 4ae0d81435edaa9c.vercel-dns-017.com`. MX is
  Google Workspace; leave it alone. Vercel plan: Hobby until ticket sales are
  added, then Pro.
- **Sanity:** project `k0dqlqmb`, dataset `production`. CORS allows
  `localhost:3000`, `localhost:3333`, the Vercel production URL, and both
  `tedxharvardsquare.org` origins (credentials). Wildcard for
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
| 2026-10-08 | **Domain switched from Webflow to Vercel**, `www` primary. Webflow's "Apply to speak" (Tally) and "Join our community" (Linktree) buttons dropped. Webflow `/schedule` unpublished; ours redirects to `/flagship`. Legal review of `/privacy` and `/terms` signed off. Stay on Vercel Hobby until tickets. |
| 2026-10-08 | **Google Analytics 4** (`G-MP9EG22C1W`, property run by Nana on marketing) on the live domain only, not in `/studio`. No cookie banner (owner); `/privacy` discloses it. |

---

## Owner to-do (as of 2026-10-08)

Everything waiting on the owner, in one place. Tick items off here as they land.

**In Studio (`/studio`)**
- [ ] **Talk stage photos**: Talk → Stage photo, landscape, with alt text. 4 of 21 done (the featured four, 2026-10-06); the rest show the speaker portrait if featured.
- [ ] **Talk videos still missing**: Carlos Gascón Alvarez, Ceren Koca, Alissa M. Kleinnijenhuis (not on YouTube as of 2026-10-06). Mariam Khayretdinova (2025) has no talk record at all.
- [ ] **Review Claude's draft Flagship copy** (Against Entropy → Flagship page tab): the three "Why attend" reasons, the "Who's in the room" line, and the venue note ("A short walk from Harvard station on the Red Line").
- [ ] Against Entropy → Flagship page: **What's included** (until filled, the page says details are on their way), **Speakers note** (e.g. "Lineup announced in December"), **Program link** once a program page exists, and real **Audience figures** if there are any.
- [ ] Add 2027 speakers to the edition when announced: the Flagship page swaps its coming-soon tiles for their portraits by itself.
- [ ] Against Entropy → **Date** once confirmed (left empty on purpose; the site says "Date to be announced").
- [ ] Optional: Home page → **Flagship photo**, one lit speaker on a dark stage (else the home page uses the second hero photo, the speaker in profile).
- [ ] Optional: Site settings → Mission statement, drop the em dash.
- [ ] Edition 1 date and theme; Edition 2 theme.
- [ ] Job titles for the ten 2025 speakers (blank in Webflow too).
- [ ] Confirm the Arrow Street Arts white logo (inferred from Webflow's "Mask group-2").
- [ ] Media library: 12 unused past-sponsor logos (uploaded 2026-09-25, not on the site). Delete, or ask Claude to.
- [ ] Real content for House events, team, and past-edition themes (no placeholders). TED expects core team names and backgrounds on the site; an `/about` team section is ready to build once they exist.
- [ ] Invite marketing editors: sanity.io/manage → Members → Editor.

**Analytics**
- [ ] Ask Nana to add you to the GA4 property (Admin → Property access management).
- [ ] Legal reviewer to see the new analytics wording on `/privacy` (Oct 8).

**Domain cutover follow-up**
- [ ] **Search Console:** submit `https://www.tedxharvardsquare.org/sitemap.xml`.
- [ ] **Oct 13:** delete the `_webflow` TXT record in Squarespace and cancel Webflow hosting (renews Oct 14). Until then, rollback = put back `A @ 198.202.211.1` and `CNAME www cdn.webflow.com`.
- [ ] Merge PR #38 (site-verification token typo).

**Decisions**
- [ ] House naming and weight on `/home2` (vs CLAUDE.md / DESIGN.md).
- [ ] Logo: no SVG exists; PNGs in `public/brand/` stand in.

**Tooling (one-time, per machine)**
- [ ] Vercel MCP sign-in (`/mcp` in an interactive `claude` session).
- [ ] Let Claude write to Sanity and merge docs PRs without prompts: auto mode blocked partner creation and a docs merge on 2026-09-25 even after chat approval. Add allow rules in settings, or approve from an interactive session.

Resolved: the FAQ "How do I get there?" answer describes Arrow Street Arts, which is the 2027 venue too, so it is correct again.

---

## Known issues

1. **Small red text fails WCAG AA** (brand red on black is 4.35:1, needs 4.5).
   Eyebrow labels on `/speakers`, `/faq`, the hero edition label, and the
   year in the speaker dialog; red hover on talk titles and FAQ questions.
   Fix per `DESIGN.md` §3 (red mark beside foreground text). **Do first.**

---

## Next up (suggested order)

1. Fix the red-text contrast issue (small, visible to every visitor).
2. Sponsor packages/tiers on `/sponsor`, if the organizers want them public (the pitch is live).
3. Team section on `/about` once the organizers send names and bios.
4. Program page for the Flagship (its "Explore the program" button appears once Studio has the link).
5. CI: GitHub Actions running lint, typecheck, build on every PR.
6. Performance and accessibility pass (Lighthouse ≥ 90, WCAG 2.2 AA); Vercel Speed Insights.

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

Owner didn't like speaker portraits on home (read as the next lineup). Replaced
with "Watch past talks": four recorded talks as rows (title, speaker, year,
small B&W thumbnail), videos first, linking out to the video or `/speakers`.

Menu and footer squared (PR #14). Menu: key pages are ruled full-width rows
with an arrow (red on hover); the photo is desktop-only (phones gave it a
cramped band); the footer's red halftone (`FooterGlow`, now with `className`
and `active` props, paused while the menu is closed) rises from the panel's
bottom edge. Footer: "Stay in the room." is the heading (no eyebrow), buttons
are `SquareLink` (moved to `src/components/ui/`), and each column hangs from a
hairline rule with a plain small heading. Glow animation unchanged.

**Needs real content — talk stage photos.** Talks have a new optional Studio
field, **Stage photo** (`still`). The home page's past-talks rows show it; until
it is filled, each row shows the speaker's portrait instead. The owner has a
photo for every talk: upload them in Studio → Talk → Stage photo (landscape,
with alt text). Rows with a stage photo are listed first.

Flagship section on `/home2` reworked: the ruled When/Where table and the
dot-drawn "03" are gone. The facts are one sentence ("Flagship, edition 3. 2027
at Arrow Street Arts, Cambridge. Date to be announced.") and the right side is a
photo printed entirely in red halftone (`HalftonePhoto`), which settles in from
the top and swells under the pointer. It uses the edition's **Poster** field
if set, else the first home page photo. New `data-dot-clear="wide"` makes the
page's dot field fade far out around it.

Mobile "scroll past the footer" was iOS rubber-band overscroll revealing black
under the footer glow; `overscroll-behavior-y: none` on `html` stops it (also
disables pull-to-refresh in Android Chrome).

### 2026-09-25 — home 2 on real content

Checked `/home2` locally against live Sanity: every image loads, no console
errors, no overflow. Sanity edits (published): Against Entropy venue set to
Arrow Street Arts, 2 Arrow St, Cambridge MA; its placeholder date
(2027-02-01) cleared, so the page says "Date to be announced". Owner confirmed
no past sponsors on the site — the 3 live partners only, logos not linked.
Still open: talk stage photos (Studio → Talk → Stage photo), optional edition
Poster. Twelve unused past-sponsor logo assets were uploaded to Sanity by
mistake and can be deleted from the media library.

### 2026-09-28 — home 2 becomes the home page

Owner approved. The `/home2` page is now `/` (indexed), `/home2` redirects
permanently to `/`, and `src/components/home2/` is `src/components/home/`.
Deleted the old hero, the `pixel-blob` three.js scene, `hero-motion`, the
placeholder hero images and `GlassButton`. The topics list left the home page
with the old hero (`getTopics` and the topics in Sanity are kept). three.js,
R3F and the `canvas/scene.tsx` wrapper stay for future scenes.

### 2026-09-29 — House page

New `/house`: intro, **Upcoming** (Studio → House event, soonest first, each row
RSVPs on the event's Luma link) and **Past** (shown only once there is one).
With nothing upcoming it says "More to be announced." and points to the Luma
calendar. Events move to Past by themselves once their date passes. New Studio
field **Luma calendar link** (Site settings → Contact & social), set to
`https://luma.com/tedxhsq` (owner); the footer's Follow column
links it too. Checked in the browser with local mock events (not saved to
Sanity). Intro copy is Claude's, adapted from the Webflow home page; owner to
review.

### 2026-10-06 — featured past talks, video links

New Studio field **Home page → Featured talks** (up to 4 talk references, in
order) drives the home page's "Watch past talks"; empty falls back to the old
automatic pick. Rows are taller (thumbnails 224px wide on desktop). PR #23,
merged. Sanity edits (published): owner's stage photos on Jeff Harmon, Shawna
Young, Anya Dillard and Marinela Profi's talks, which are the featured four
(Hanan Nagi dropped); Jeff's video added. Found and linked 6 more videos on the
TEDx Talks channel (Abramson, Choe, Swan, Cordier, Bertrand, Neil). Nine talk
titles changed to match their YouTube titles (owner's call); slugs left as
they were so links don't break.

### 2026-10-06 — home layout and menu polish

Breaking up the run of left-aligned sections on the home page. Past talks
(#25): no rules between rows, no background on hover (the photo colours in
instead, and the icon brightens; keyboard focus too), thumbnails cropped to
4:3 via a new `--aspect-photo` token. Flagship (#26): photo in the left column
on desktop, text right; the red plate now drifts right, toward the text. The
current Flagship photo faces left, away from the text: a right-facing speaker
in Studio (Home page → Flagship photo) would sit better. Partners (#26):
centred, logos 40px tall on mobile, 56px on desktop. Menu (#27): About, FAQ and
Contact grouped flush left, `text-title`, ink-200, so they read over the
halftone. All merged.

### 2026-10-06 — Flagship page

New `/flagship`, led by the current edition (Against Entropy). Hero with the
theme across the top; the theme statement lit line by line; the three
questions stepping across the grid; When/Where beside the edition number drawn
by the dot field; "Meet what's next" beside the Flagship photo; "Now what?"
with the one ask (ticket link once set on the edition, else the early-access
list); past editions; partners. Everything comes from the edition in Studio:
facts on its **Details** tab, the page copy on a new **Flagship page** tab
(place, month until the date is set, statement lines, invitation, questions,
program heading/text/link, closing heading/text). Empty parts are hidden. Sanity
edit (published): the organizers' starter copy filled in on Against Entropy, and
its Theme statement changed to "Everything tends toward disorder. Unless we
choose otherwise." (also shown on the home hero). With no Program link the
section says "Program to be announced" and links to past talks. The home page's
Flagship section now leads with "Explore Against Entropy" → `/flagship`.

### 2026-10-06 — Flagship page, second pass (PR #31, merged)

Owner wanted the page to feel unlike home: more photos, calmer, alternating
backgrounds, dots as an accent. Researched three inspiration sites and other
conference pages, mocked three heroes; owner picked the full-bleed photo. Now:
photo hero → theme (dark, dot field at 0.55) → Why attend + Who's in the room
(paper) → Meet what's next → Speakers 2027 (portraits once speakers are added to
the edition, else "Lineup coming soon" with halftone tiles) → What's included
(paper, "details on their way" until filled) → venue split (photo + paper panel,
Maps link) → Now what? → past editions. Dropped: the dot-drawn "03", the
When/Where table, the partners row. New Studio fields on the edition's Flagship
page tab: first screen photo, Why attend (title/text/photo), Who's in the room
(+ optional real figures and photo), speakers note, what's included, venue photo,
getting there. Sanity (published): photos picked from the Feb 2026 shoot and
**draft copy for owner review** (three reasons, the audience line, "A short walk
from Harvard station on the Red Line").

### 2026-10-07 — TEDx licence compliance (PR #33, merged)

Reviewed the site against the TEDx rules (Web + Social) and TED's organizer
guide. Fixed: partner logos off the homepage (TEDx rules forbid sponsor logos or
names there); new `/sponsor` ("Partners") page with logos at 40px, smaller than
the 48px lockup, and a "Partner with us" email; homepage "What is TEDx?" section
with the required text and a link to ted.com/tedx; new `/about` with the
required "About TEDx" and "About TED" text (fixes the menu's dead About link);
footer licence link now points to ted.com/tedx. Wording in `src/content/tedx.ts`.
Removed the Partner "Presenting" tier (no partner used it).

Both PRs merged 2026-10-07 (#33, then #31). Session tooling notes: two Claude
sessions shared this checkout, so this one used the other's dev server on :3000
(Next refuses a second `next dev` in the same folder); the Browser pane returns
blank screenshots while hidden, so DOM checks stood in.

### 2026-10-07 — Sponsor pitch

`/sponsor` now carries Lorena's pitch from a new Studio singleton, **Sponsor
page** (headline, wide photo, pitch paragraphs, closing question, button
label). Layout: headline on black, wide B&W photo (menu's Sponsor photo until
one is set), the pitch on paper, partner logos, then the ask with a "Become a
sponsor" email button and the address (Site settings → contact email). A fixed
line under the button says partners have no say in who speaks (TEDx rule).
Content created and published in Sanity.

### 2026-10-08 — Domain cutover

Moved `tedxharvardsquare.org` from Webflow to Vercel. Audit first: the live
Webflow site had only six published URLs (`/`, `/faq`, `/flagship`, `/house`,
`/speakers`, `/sponsor`), no sitemap, no CMS detail pages, no analytics or
forms (inline scripts were UI only), so no new redirects were needed. Added both
domains to Sanity CORS; owner added them in Vercel (`www` primary, apex 308)
and swapped the A and CNAME records in Squarespace, leaving MX and TXT alone.
Certificates issued within minutes; every page, both redirects, Studio,
`robots.txt` and `sitemap.xml` checked on the real domain. Found the Google
verification meta missing a character (PR #38).


### 2026-10-08 — Home polish, mobile overflow, headshots (PR #41, merged)

Owner feedback on home. Dot field: the mass now fades well past its old rim,
red giving way to loose grey dot by dot (dithered) so there is no circular edge;
the pointer drags a tapering trail instead of an orb. New `data-dot-stop`
attribute fades the field out above a section: "What is TEDx?" now sits on plain
black. Footer glow spans the whole footer, so its tail rises behind the links
with no edge. Motto: `text-statement` a step smaller (also shrinks the Flagship
page's statement), the answer at `text-title` in grey for a clear hierarchy,
words blur-fade in once on scroll. Photo strip hover is now a soft tail of red
halftone (the Flagship speaker-tile print) instead of square pixels.

Mobile: the Flagship photo's red plate pushed the home page sideways at 375px
(now `overflow-x-clip`); long FAQ questions overflowed (now wrap). Every page
and three speaker pages measured 375px wide afterwards.

Content: em dash removed from the mission statement ("We exist to create those
moments, on stage and in every room we build year-round."). New headshots for
Jayna Swan and Martine Bertrand (owner's files, already web-sized, uploaded
as-is). The two old headshot assets are unreferenced; the owner is deleting
them in Studio (the agent does not hard-delete).

Note: this Mac still resolved the domain to Webflow from a stale DNS cache after
the cutover; public DNS was correct. Check the live site with
`curl --resolve www.tedxharvardsquare.org:443:216.198.79.1` if in doubt.
