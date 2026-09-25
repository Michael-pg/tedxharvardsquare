@AGENTS.md

# TEDxHarvardSquare

Rebuild of tedxharvardsquare.org — a three.js + GSAP animated site for a
Cambridge, MA community organization. The org runs a flagship annual conference
(**Flagship**) **and** year-round programming (**House** — the org's own name;
never "Community"); the site must give the year-round work real weight, not
treat it as a footnote to the main event.

Deploys to Vercel. **The live domain stays on Webflow until the owner says
otherwise** — build on the Vercel site only. Start each session with
`docs/PROGRESS.md` (state, decisions, open questions, next up).

## Stack

| Concern    | Choice                                       |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 16, App Router, TypeScript, src dir   |
| Styling    | Tailwind v4 (`@theme` tokens in globals.css)  |
| Animation  | GSAP 3.15 + `@gsap/react` (`useGSAP`)         |
| 3D         | three.js + React Three Fiber + drei           |
| Icons      | lucide-react                                  |
| Content    | Sanity (project `k0dqlqmb`), Studio at /studio |
| Hosting    | Vercel                                        |

Next.js was chosen over the usual Vite default because this is a public
community site: people search for it by name, and speaker and talk pages need
to be server-rendered and indexable.

## Rules specific to this project

**Import GSAP from `@/lib/gsap`, never from `gsap` directly.** That module is
the single plugin registration point and sets the project's easing and duration
defaults. Importing the package directly gets you an unregistered plugin at
runtime.

**Every 3D scene is a folder under `src/components/canvas/scenes/`** with
`scene.tsx` (the R3F content, default export) and `index.tsx` (the
`dynamic(..., { ssr: false })` boundary). Consumers import the folder. three.js
is ~600kb that cannot run on the server and must not block first paint — do not
route around this by passing R3F children in from a statically-imported module.

**Components read content from `@/content`, never from Sanity directly.**
Each accessor there is a GROQ query whose projection returns the exact type in
`src/content/types.ts` — references as slugs, images as `{ src, alt, width,
height }` — so components never see Sanity's storage shape. The module is
`server-only`; client components get content values as props.

**Schema changes touch three places:** the type in `src/content/types.ts`, the
schema in `src/sanity/schemaTypes/`, and the projection in `src/content/index.ts`.
Keep them in step.

**No arbitrary Tailwind values.** `text-[17px]` and `bg-[#333]` are bugs. If the
ramp in `globals.css` is missing something, add it to the ramp.

**Every animation respects `prefers-reduced-motion`.** Use `useReducedMotion`
from `@/lib/use-reduced-motion` and skip creating tweens when it returns true.
Reach for `<Reveal>` and `<SplitReveal>` in `src/components/motion/` before
writing a bespoke tween — they already handle this.

**`[data-animate]` elements start hidden in CSS.** Any component using it must
call `gsap.set(el, { autoAlpha: 1 })` before tweening, or the element will
animate toward `visibility: hidden` and never appear.

## Design direction

**Read `DESIGN.md` before any UI work** — colour, type, spacing, imagery,
motion, and the ship checklist. In short: intentional minimalism, typography
carrying the hierarchy, no generic card grids; the 3D work supplies the energy
and TEDx red is the only chromatic value. **Figtree** is the site typeface;
Helvetica Neue is reserved for the logo. Small red text fails contrast — see
`DESIGN.md` §3.

The home hero's 3D scene is `scenes/pixel-blob/`.

## Content status

Sanity is the source of truth; edit content at `/studio`. It was filled by two
one-time scripts. Neither should be re-run — both overwrite Studio edits.

- `scripts/seed-sanity.ts` (Aug 2026 copy of the live site): site settings,
  mission statement, the 15 topics, and "Against Entropy" (Boston, 2027).
- `scripts/import-webflow.ts` (Webflow CMS snapshot, 2026-09-24, kept in the
  gitignored `research/webflow-export/`): the 2025 edition and the Feb 21 2026
  edition (Arrow Street Arts), 24 speakers incl. 2 performers, 21 talks, 13 FAQs, 3 live
  sponsors, home-page photography, and the live contact/newsletter/social links.
  Alt text was written for every image; speaker portraits use "Portrait of
  {name}".

House events, team, and past-edition themes are still empty, awaiting real
content from the organizers. Do not fill them with plausible-looking fakes;
placeholder people survive to production. **Edition numbering (owner, 2026-09-25):**
Edition 1 = April 2025, Edition 2 = Feb 21 2026 (Arrow Street Arts), Edition 3 =
"Against Entropy" (Boston, 2027). The import stored them as 2/3/4; the `number`
fields in Studio must be corrected. Still unconfirmed: Edition 3's venue
and exact date, Edition 1's date and theme, and job titles for the 2025 speakers.

Published content revalidates every 60 seconds, so Studio edits go live
without a redeploy.

## Agent tooling installed here

**GSAP skills** — the official GreenSock suite (`gsap-core`, `gsap-timeline`,
`gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-performance`,
`gsap-utils`, `gsap-frameworks`) from `greensock/gsap-skills`. They are
user-scope, not vendored in this repo, so each machine installs them once:
`npx skills add https://github.com/greensock/gsap-skills -g -a claude-code`
(lands in `~/.claude/skills/`), or `/plugin marketplace add
greensock/gsap-skills` from an interactive `claude` session. Consult them
before writing non-trivial GSAP.

**Motion AI Kit** — the `motion` skill plus a `motion-reviewer` agent in
`.claude/agents/`, and two hosted MCP servers in `.mcp.json`. `motion` is
connected; `motion-plus` returns 401 until someone signs in through the agent's
OAuth prompt. Note this is *tooling only* — Motion is deliberately **not** a
runtime dependency. GSAP owns animation in this project, and running two
animation libraries would mean two competing tickers and roughly 30kb of
duplicated capability. If Motion should actually ship, that is a decision to
make explicitly rather than by accident.

**Next.js DevTools MCP** — `next-devtools` in `.mcp.json` (Vercel's
`next-devtools-mcp`). Connects to the running dev server's built-in
`/_next/mcp` endpoint for live errors, routes, and build state, and serves the
Next 16 docs. Start `npm run dev` before relying on its runtime tools.

**Vercel MCP** — `vercel` in `.mcp.json`, hosted at `mcp.vercel.com`.
Deployments, build logs, and project settings. Requires a one-time OAuth
sign-in per machine.

**Sanity MCP** — `sanity` in `.mcp.json`, hosted at `mcp.sanity.io`. Query and
edit content, inspect schemas, and manage the dataset for project `k0dqlqmb`.
Requires a one-time OAuth sign-in per machine.

**Design skills** — `impeccable` plus the `taste-skill` set
(`design-taste-frontend`, `high-end-visual-design`, `minimalist-ui`,
`redesign-existing-projects`, and others) in `.claude/skills/`. These are
vendored third-party sources; ESLint ignores `.claude/**` so their scripts do
not pollute lint output.

## Repo hygiene

`brief/`, `research/`, `notes/`, and `deliverables/` are internal context and
are gitignored. Read them when relevant; never commit them.
