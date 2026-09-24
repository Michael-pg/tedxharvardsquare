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
| Pages | Home (3D hero with real photos, topics), `/speakers`, `/faq`, `/studio` |
| Content | All in Sanity — see CLAUDE.md "Content status" |
| Nav | Flagship · Speakers · House · About (+ menu). Only Speakers/FAQ exist yet |

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
| 2026-09-24 | Edition 4 (2027) is in **Boston**. Edition 3: Feb 21 2026, Arrow Street Arts. Edition 2: April 2025. |
| 2026-09-24 | Performers are stored as speakers (`kind: performer`) and hidden from `/speakers`, matching Webflow. |

---

## Open questions (need the owner/organizers)

- Logo: no SVG exists; the Webflow PNGs (`public/brand/`) stand in. Swap for SVG if one is ever made.
- TEDx rules vs. the Partner **"Presenting"** tier.
- Edition 4 venue and exact date; Edition 2 date and theme; Edition 3 theme.
- Job titles for the ten 2025 speakers (blank in Webflow too).
- FAQ "How do I get there?" still describes Arrow Street Arts (2026 venue).
- Arrow Street Arts white logo was inferred from Webflow's "Mask group-2" — confirm in Studio.
- Webflow `/schedule` page (Edition 3 run-of-show): archive or drop?

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
2. Footer: newsletter (Substack), contact, Instagram/LinkedIn — data already in Sanity.
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
