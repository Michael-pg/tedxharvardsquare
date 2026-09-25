# Home 2 — the dot system

A brainstorm and working plan for a second home page, built at `/home2` alongside
the current one. It takes the footer's red halftone as the visual language for
the whole site. Nothing here is decided until the owner signs off. Open
questions are listed at the end.

---

## 1. The idea in one line

**The red dot is the unit.** A dot is a pixel, a bit, a halftone cell, a person
in a room, an idea. The whole site is drawn in one material: TEDx red dots on
a strict grid, over ink.

That material already exists, in two places:

| Where | What it is | What we keep |
| --- | --- | --- |
| Footer (`FooterGlow`) | 2D canvas, dots on an offset halftone grid, gradient made from dot *size* | **This is the target look.** The grid discipline is what makes it read as "code" rather than "blob". |
| Hero (`pixel-blob`) | WebGL, ~60k free-floating points in a noisy disc | The energy. But the points are not on a grid, so it reads as organic, not computational. |

Home 2 moves the hero onto the footer's grid. **Grid = code. Dot size = signal.**

### Why it fits the conference, not just the look

- **Edition 4 is "Against Entropy"**, and its theme line is "Everything tends
  toward disorder. Ideas are how we push back." Dots moving from noise into
  order is that sentence, animated. We hardly need a metaphor.
- **"Ideas worth spreading"** is propagation: one dot lights, its neighbours
  light. That is how a talk works, and how House works across a year.
- **SaaS/tech energy without cosplay.** We borrow the *discipline* of product
  sites: grids, tabular numbers, status lights, spec sheets, changelogs. We
  keep the ideas and the people at the front. The rule: **one metaphor layer
  per section**. A spec sheet is fine; a spec sheet in a fake terminal
  with a fake cursor is too much.

---

## 2. Hero directions (left-aligned)

Common to all three: the headline sits **left-aligned, bottom-left**, like an
editorial cover or a product launch. Meta runs along the top or bottom edge as
a thin data rail. The dot field carries the right two-thirds and bleeds under
the type.

```
┌──────────────────────────────────────────────────────────────┐
│ [lockup]                                   Flagship House  ≡ │
│                                                               │
│                              · · ∙ ● ● ● ∙ ·                 │
│                           · ∙ ● ● ● ● ● ● ● ∙ ·              │
│                          ∙ ● ● ● ● ● ● ● ● ● ● ∙             │
│  ● Edition 04 — Against Entropy   ∙ ● ● ● ● ● ● ● ∙ ·        │
│                                    · ∙ ● ● ● ∙ ·             │
│  Where ideas                                                  │
│  meet Cambridge.                                              │
│                                                               │
│  [Get early access ↗]   House events →                        │
│ ───────────────────────────────────────────────────────────── │
│ 42.3736° N 71.1190° W   Boston · 2027   Cambridge 14:02:11    │
└──────────────────────────────────────────────────────────────┘
```

### A. "Against Entropy" — order from noise *(recommended)*

On load the field is static: sparse, random dots of random size, like TV
snow. Over ~1.5s it **resolves** into the halftone grid and a shape. Order
wins, but only just: the edges stay noisy and drift back toward disorder
unless you act. The pointer is the "idea": wherever it goes, the dots snap
into alignment and swell. On scroll, the whole field resolves into a clean
grid and hands off to the next section.

- Strongest tie to real content (the Edition 4 theme).
- The shape it resolves into can change per edition, so the hero is reusable
  each year: next year's theme gets a new resolve target, same engine.
- Resolve targets: a soft disc (today's blob, gridded), the edition number
  in dot-matrix digits ("04"), or the theme word itself.

### B. "Signal" — propagation

A calm, dim grid. Every few seconds one dot ignites and a wave travels
outward, lighting neighbours with a delay, like a ripple or a cellular
automaton. Clicking or tapping starts your own wave. It reads as "an idea
spreads", and it is quieter than A.

### C. "Readout" — dot-matrix type

The headline's key word, or the date and countdown, is set **in dots** by
the engine itself: 5×7 bitmap glyphs, each cell a halftone dot. Characters
"boot" in column by column. This is the most "code". It is also the riskiest
for taste and accessibility, since real text has to exist in the DOM as
well. It is better used as a detail (numerals, the countdown) than as the hero.

**Recommendation:** build A with B's ripple as the pointer or click
interaction, and keep C for numerals across the site. Prototype A and B as
switchable variants on `/home2?hero=a|b` so we choose on the real preview,
not in the abstract.

### Photos

The current hero flies six event photos through the blob. Options:

1. Drop them from the hero. Photography moves to its own section (§4.6).
2. Keep them, but each photo **arrives as a halftone** (the photo rendered in
   red dots) and resolves to full colour as it lands. Same material, and very
   "brand agency".

Option 2 is the more distinctive one. Option 1 is cleaner and faster. Start
with option 1 and prototype option 2 in the photography section.

### Copy

"Where Ideas Meet Community" is the current tagline. Worth revisiting:
"Community" is the word we avoid for the programme (it's House). It reads fine
as a generic word, but a new hero is a good moment to write a sharper line.
That's the organizers' call. Candidates to react to, not to ship:

- "Ideas, in the room where they happen."
- "Against entropy." (the edition as the headline, and the tagline as kicker)
- "Cambridge thinks out loud."

---

## 3. The graphic system (the brand-agency layer)

These are elements that make it feel designed, not templated. All of them are
dots, grid, or type. **No new colours.** Red stays the one chromatic value, and
the rule of one red moment per viewport still holds.

| Element | What it is | Where |
| --- | --- | --- |
| **Dot-matrix numerals** | Edition numbers, dates, counts drawn by the dot engine (5×7 glyphs). Real text sits in the DOM beside them for screen readers and SEO. | Edition "04", stats, countdown |
| **Halftone photography** | A photo re-rendered as a red dot screen. It resolves to the real photo on hover or scroll. | Photo band, speaker features, OG images |
| **Status light** | A small pulsing red dot plus a label: "Early access open", "Next House event: Oct 14". Like a SaaS status page, and it fixes the small-red-text contrast issue by design. | Hero, Flagship card, nav pill |
| **Data rail** | A thin line of tabular metadata: coordinates of Harvard Square, city and year, live Cambridge clock (the footer already has one). | Hero bottom edge, section heads |
| **Index marks** | Section numbers ("01 / 07"), grid ticks at the gutters, crop or registration marks at section corners. | Every section head |
| **Dot rules** | A row of small dots instead of a hairline between sections. They can "fill" left to right on reveal. | Section dividers |
| **Spec sheet** | A two-column key and value table ("Date · Venue · Format · Seats · Talks") instead of paragraphs. The SaaS move applied to an event. | Flagship block, House event cards |
| **Changelog** | House events as dated release notes: "v3.2 — Oct 14 — Salon: Precision Psychiatry". | House feed |
| **Generative posters** | The engine exports a still (PNG/SVG) per edition or House event: shareable, printable, and used as OG images. | Social, print, `/opengraph-image` |

### Type question

"Code" vibes usually come from a **monospace** face for metadata. DESIGN.md
currently allows Figtree only. Two ways to go:

1. **Stay Figtree-only.** Use `tabular-nums` and `text-label` for data, and let
   the dot-matrix numerals carry the "machine" feel. This keeps the system tight.
2. **Add one mono for data only** (Geist Mono or JetBrains Mono, via
   `next/font`), used only at `text-label` size for metadata, coordinates and
   spec sheets. Never for headlines or body.

I lean to (2). It is the cheapest single change that reads as "tech", but it
is a DESIGN.md change and so the owner's call.

### TEDx licence check

Keep the dot system **away from the logo**: no dot-rendered lockup, no
animating the X, no dot "x" mark that could read as a variant of the TEDx
logo. The lockup stays the supplied artwork. Dots live around it, never in it.

---

## 4. Home sections (brainstorm)

This is the order as a story: **what this is → why → the two programmes →
proof → people → join.** Each row notes whether the content exists today.

| # | Section | What it does | Content today |
| --- | --- | --- | --- |
| 1 | **Hero** | Headline, edition status light, early access plus House links, data rail | ✅ |
| 2 | **Manifesto** | The mission statement, large, left-aligned. Words sharpen from dot-blur to crisp as they reveal (a `SplitReveal` variant, not a second pinned set piece) | ✅ |
| 3 | **Two programmes** | Flagship and House **side by side, equal width**. Each has a spec sheet, a status light and a CTA. This is the section that gives House real weight. | Flagship ✅ · House ⚠️ no events yet |
| 4 | **Edition 4: Against Entropy** | Theme statement plus the 15 topics as an indexed list (01–15). Hovering a topic nudges a small dot field (noise to order). | ✅ (theme statement is a placeholder) |
| 5 | **By the numbers** | 3–4 stats in dot-matrix numerals: editions, speakers, talks, and attendees *if the organizers give a real figure* | ⚠️ attendee count unknown; the rest are real (3 editions · 24 speakers · 21 talks) |
| 6 | **Talks** | 3–4 featured talks as a list (speaker, title, year, duration) with halftone portraits that resolve on hover. "Watch all 21 →" | ✅ |
| 7 | **In the room** | A photography band with halftone-to-photo reveal. It answers "what does it feel like to be there". | ✅ home photos from Webflow |
| 8 | **House feed** | Upcoming and recent House events as a changelog. Empty state: "The next House event is being planned. Get the list." Absence, never fakes. | ❌ awaiting organizers |
| 9 | **Partners** | The live sponsor logos (white), plus a clear "Partner with us →" to the Sponsor page | ✅ 3 partners |
| 10 | **Footer** | Existing footer. The sign-up lives there, so no separate newsletter section. | ✅ |

**Cut or folded:** a separate newsletter block (footer has it), an FAQ teaser
(link from the Flagship block instead), and team (no content yet; it belongs on
About anyway).

**One set piece rule:** DESIGN.md allows one pinned scroll sequence per page.
The hero is it. Everything else reveals once. The dot fields in sections 4, 6
and 7 are small, ambient and pointer-driven, not scroll-jacked.

---

## 5. Engineering plan

### 5.1 Shared dot engine (do first)

Extract the renderer out of `footer-glow.tsx` into `src/lib/dot-field/`:

- `createDotField(canvas, { cell, buckets, intensity(x, y, t, pointer) })`:
  the grid loop, bucketed `Path2D` batching, DPR handling, resize and
  intersection observers, pointer easing, and the reduced-motion single frame.
- Each use supplies only its **intensity function**. The footer becomes
  roughly 30 lines, and the hero, stats and photos reuse the same machinery.
- `glyphs.ts`: 5×7 bitmap font for digits and a few characters (dot-matrix
  numerals).
- `halftone.ts`: sample an image into per-cell luminance, which gives
  halftone photography.

The refactor is a no-visual-change PR to the footer, so it is safe to merge
on its own.

**2D canvas vs WebGL.** A full-viewport grid at a 10px pitch is ~13k dots at
1440×900, which 2D canvas handles well with bucketed paths, and it keeps
three.js off `/home2` entirely (a big first-load win). If the hero needs
more density or a 3D camera move, we port the same intensity function to a
shader under `scenes/dot-grid/` (per the scene-folder rule). **Start 2D,
measure, then decide.**

### 5.2 Route

- `src/app/home2/page.tsx`: same data accessors as `/`, and
  `robots: { index: false }` so it is never indexed. It stays out of the nav.
- New sections in `src/components/home2/`, so the current home stays
  untouched.
- `?hero=a|b` switch for comparing variants on the preview. Remove it once
  we pick one.

### 5.3 Phases (one PR each)

1. **Dot engine extraction**, with the footer on the new engine (no visual change).
2. **`/home2` hero**: variants A and B, left-aligned layout, data rail, status light.
3. **Sections 2–4**: manifesto, two programmes, Edition 4 and topics.
4. **Sections 5–7**: numbers (dot-matrix), talks, halftone photo band.
5. **Sections 8–9**: House feed with an honest empty state, partners.
6. **System write-up**: update DESIGN.md (§3 red status dots, §4 mono if
   approved, §7 dot motion rules), and add components to §8.
7. **Swap**: `/home2` becomes `/` once the owner approves. The old hero and
   `pixel-blob` are deleted, not kept around.

### 5.4 Guardrails

- Reduced motion: every field draws one still frame, and the resolve
  animation is skipped, so it shows the ordered state.
- All real text lives in the DOM. Canvas is `aria-hidden`.
- Fields animate only while on screen (the footer already does this), and at
  most 2 are live at once.
- Mobile: larger cell pitch, no pointer effects, tap triggers the ripple.

---

## 6. Inspiration to gather

These references are from memory, not a fresh crawl, so treat them as starting
points and check they still look the way described. The most useful input is
the owner's own picks: collect them in an Are.na channel or a Figma board,
with one line on what you like in each.

**Dot and grid as brand**
- *Nothing* (the phone company): dot-matrix type, red plus mono, restrained.
  This is the closest existing brand to where we are heading, so it is also
  the one to be careful not to copy.
- *Wim Crouwel*, New Alphabet and his grid posters: the design-history
  grounding for type built from a grid.
- Ben-Day dots and halftone print (Lichtenstein): the pop end of the same idea.
- Airport and train departure boards: the dot-matrix and split-flap language
  for dates and schedules.

**Tech and SaaS launch sites** (for layout, left-aligned heroes, data rails)
- Vercel and its Ship conference pages, Linear, Stripe Sessions, Raycast,
  Resend, GitHub Universe, Figma Config.

**Where to browse:** godly.website, siteinspire, Awwwards (filter: minimal),
Savee, Cosmos, and Fonts In Use (to see mono and grotesk pairings in the wild).

---

## 7. Open questions for the owner

1. Hero direction: A (order from noise), B (ripple), or both prototyped first?
2. Add a mono face for metadata, or stay Figtree-only?
3. Hero photos: drop them, or bring them in as halftone?
4. Tagline: keep "Where Ideas Meet Community" or ask the organizers for a new line?
5. Real attendee numbers for the stats section, or leave the stat out?
6. Is Nothing-adjacent OK, or should we deliberately steer away from it?

---

## 8. Owner feedback, round 1 (2026-09-25)

- **Hero: A, made subtler.** B's pulse is too literal; drop it (no click ripple either).
  Disorder is grey drifting noise; order is red on the grid. The pointer brings
  order without turning everything red.
- **Story scroll after the hero, ~300vh pinned**, built on the motto: "The right
  idea, heard by the right person, at the right moment, can change the course of
  a life, a company, a policy." Noise → one idea (red dot) → it reaches a person
  (halftone portrait in a tagged frame) → the field orders → the real photo resolves.
  This becomes the page's one pinned set piece.
- **Swiss grid:** a strict 12-column grid, very large type, information spread
  across columns in a clear reading order.
- **Hard-edged square buttons**, replacing the glass pills. White fill for primary,
  1px outline for secondary, red only on hover.
- **Duotone images:** red halftone at rest, grayscale photo with red multiply on reveal.
- **Framed media with mono tags and corner handles** (e.g. `PERSON_01.RAW`), after
  builderstable.net.
- Hero copy is open; the motto may lead.
- References the owner likes: craft.wild.as, builderstable.net, thedesignsociety.fr,
  pear.no (too much scroll, but good ideas), omegayeast.com.
- Sketches (not committed): `deliverables/hero-sketch.html` (A vs B),
  `deliverables/hero-sketch-v2.html` (this direction).

## 9. Owner feedback, round 2 (2026-09-25)

- **Headline: "Against entropy."**
- **No orb.** The field is the footer's drifting halftone bands with plenty of
  plain black. Entropy is spatial: open space is grey, scattered, drifting;
  next to type (and under the pointer) dots snap to the grid and turn red.
- **No scroll lock, no literal photo story.** The motto becomes four boxed
  statements staggered across the 12-column grid, plus a short paragraph each.
  The field flows around the boxes, and scrolling nudges it along. Type
  reveals once on scroll.
- One fixed full-viewport canvas behind the page, with `[data-box]` elements
  as keep-out zones, replaces per-section canvases.
- Sketch: `deliverables/hero-sketch-v3.html`, also published as the private
  "TEDxHarvardSquare Hero Sketch" artifact (version 2).

## 10. Owner feedback, round 3 (2026-09-25)

- Dots hugging the type read as Pac-Man, and the black boxes felt tight: both
  are gone. Text now gets a soft, feathered clearing in the field (from its line
  boxes), with no hard edges and no colour change.
- Order vs entropy is its own slow field drifting through the dots: red, gridded
  stretches and grey, scattered ones move through each other. The pointer still
  brings order. The default field strength stays; "calmer" is dropped.
- The motto stays together as one large statement (lines indented along the grid),
  with no per-line explanations. One short coda line beside it.
- Sketch: `deliverables/hero-sketch-v4.html` (artifact version 3).

## 11. Owner feedback, round 4 (2026-09-25)

- Motto: all lines flush left, no stepped indents.
- **Dot symbolism: reading pushes back against entropy.** The deeper into the
  page, the more of the field is red and gridded and the slower the grey drift,
  ending in the footer glow. A small "Entropy 1.00 → 0.00" readout tracks it.
- **Photos float through the whole page**, as in the original hero, with parallax
  at different speeds: two in the hero, a wide band, one by the motto, one per
  programme (six slots, matching the six hero photos in Studio). The treatment is
  still open (duotone, B&W or colour, optionally colour on hover).
- New reference: bymonolog.com (blocked from the sandbox; needs screenshots).
- Sketch: `deliverables/hero-sketch-v5.html` (artifact version 5).
