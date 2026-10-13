# Flagship page: review, open items, and "Over the years"

Written 2026-10-12. A review of `/flagship` as it stands on the live site,
everything still missing (ours to build vs. waiting on the owner), and a plan
for a new **Over the years** section showing past Flagship editions.

---

## 1. Where the page stands

Six beats, live since #52: poster hero → theme statement + questions → photo
collage → Speakers 2027 → venue → topics marquee → Tickets.

What works: the hero, the statement, the questions, the venue, and the topics
are all filled from Studio. JSON-LD Event is valid (name, date, place,
organizer, image).

What the page lacks: **any sense that this has happened before.** The #52
rebuild dropped the past-editions block, so apart from "Watch past talks"
under the empty lineup, nothing on the page says there were two sold-out
Flagships before this one. That's the gap "Over the years" fills.

---

## 2. Checklist

### Ours to build (code)

- [ ] **Over the years** section (§3), on `/flagship` between Topics and Tickets.
- [ ] Stable anchors on `/speakers` edition sections (`id="edition-2"` etc.)
      so each past edition can link straight to its lineup. Today the ids
      come from `useId` and can't be linked.
- [ ] Studio fields for past editions (§3.3): recap line and attendance.
      Three-place change: `types.ts`, `schemaTypes/documents.ts`, the
      `editionFields` projection.
- [ ] JSON-LD: add `endDate`, plus `offers` once `ticketUrl` is set and
      `performer` once the lineup exists. Google lists these as recommended
      for Event rich results.
- [ ] Optional: link "Over the years" from the menu's small links as
      "Past editions" → `/flagship#editions`. See decision D2.

### Waiting on the owner (Studio or a decision)

Already in `PROGRESS.md`'s owner to-do, still open:

- [ ] **Collage photos** (Against Entropy → Flagship page → Photos). The
      collage still borrows the home page's photos and talk stills.
- [ ] **What's included** list for Tickets. Until then it reads "not on sale yet".
- [ ] **Speakers note**, e.g. "Lineup announced in December." The lineup
      currently shows four "To be announced" tiles and "Lineup coming soon."
- [ ] Review Claude's copy: the venue note and the Topics line.
- [ ] Edition 1 theme; Edition 2 theme (proposed below from research).
- [ ] Job titles for the 2025 speakers (now available from TED's listing, below).

New from this review:

- [ ] Confirm the research in §4 before any of it goes into Studio.
- [ ] One photo per past edition for the Over the years panels (Edition →
      Details → Poster; the field already exists and is unused).
- [ ] Typo in Studio: Rosa Jacobs' title reads "Song Writer / Muscian".
- [ ] Name check: Studio has **Gustav** Luna; TED's listing has **Gustavo** Luna.

---

## 3. Over the years

### 3.1 Placement

A section on `/flagship`, not its own page, with `id="editions"`. Two (soon
three) editions don't fill a page, and the Flagship page is where someone
asks "has this happened before?". If the archive grows past ~5 editions, or
editions get their own photos and recaps, it can move to
`/flagship/editions/[slug]` with the section linking out.

Order on the page: … Topics → **Over the years** → Tickets. It sits just
before the ask, as proof: "two sold out, this is the third."

### 3.2 The interaction: windows that pull open

A horizontal accordion. All editions sit side by side in one row, full
section width, about 70svh tall on desktop.

- One panel is **open**, about three quarters of the width: the photo in
  colour, then the number, year, theme, date and venue, a one-line recap,
  the figures, a few speaker names, and "Watch the talks →" linking to
  `/speakers#edition-N`.
- The others are **slivers**, a narrow strip each. They show only the edition
  number set vertically and a slice of the photo in red halftone, as if the
  print is still developing. Same treatment as the home Flagship plate and
  the `/speakers` portraits.
- Hover (pointer) or click/Enter (everyone) on a sliver **pulls it open**:
  its `flex-grow` tweens up while the open one closes, like a drawer.
  The photo goes from halftone to colour as it widens, and the text fades up
  only once the panel is wide enough to set it without reflow (no text
  squashing mid-tween).
- Most recent past edition open by default. The current edition (2027) is not
  a panel. The whole page above is about it.

Phones: the same idea turned vertical. The panels stack as tall strips, one
open, the rest about 64px each, and tapping one opens it. No horizontal
scrolling.

Build notes:

- One client component, `src/components/flagship/edition-drawers.tsx`, gets
  `Edition[]` plus per-edition counts and names as props from the page.
- GSAP from `@/lib/gsap`, tweening `flex-grow`. Under
  `useReducedMotion` the panels switch instantly. Collapsed panels' text is
  `inert` so it isn't tabbed into.
- Accessibility: each sliver is a `<button aria-expanded aria-controls>`,
  the disclosure pattern (not tabs). Arrow keys move between them. The open
  panel's content is a normal region with its own heading.
- No eyebrows, no cards, red only as halftone. Typography carries the panel:
  the number in `text-numeral`, the theme in `text-statement`.
- Halftone reuse: draw the sliver photos through the existing halftone
  photo component / `createDotBatch`. Only the slivers in view animate, and
  nothing allocates per frame.
- Empty states: an edition with no photo shows the number on black. With no
  theme, the year is the title. With only one past edition the section is a
  single open panel, no drawers.

### 3.3 Content model

Most of it already exists on `edition`: number, year, theme, date, venue,
`poster` (the panel photo). Speaker and talk counts are derived from
references. New, optional, on a **Recap** group shown only for past editions:

| Field | Type | Example |
| --- | --- | --- |
| `recap` | string, ≤ 140 chars | "A full day at Arrow Street Arts: talks, Discovery Sessions, and dinners across the Square." |
| `attendance` | number, real figures only | 373 |

Accessor: `getPastEditions()` in `@/content`. It returns `status == "past"`
editions, newest first, each with `speakerCount`, `talkCount`,
`videoCount` and the first ~4 speaker names in lineup order.

---

## 4. Research: past editions (needs owner confirmation)

Found online 2026-10-12. Nothing below is in Studio yet.

**Edition 1, April 26, 2025.** Per TED's event listing
(ted.com/tedx/events/59961): venue "Dx, 33 Dunster St, Cambridge". The
listing names Gustavo Luna, Hanan Nagi, Isabella Mandis, Jackson Kerchis,
Dr. Jaya Sarin Pradhan, Jon Cobb, Dr. Stefano Sinicropi and Vivien Puppa
Kocsis, with one-line bios for each, which covers the missing 2025 job
titles. The Harvard Square Business Association listing frames "TEDxHarvardSquare 2025" around human flourishing in a rapidly changing
world (AI, biotech, climate, kindness and connection). That may be Edition
1's framing or the Feb 2026 run-up. **No named theme found.**

**Edition 2, February 21, 2026, Arrow Street Arts.** Theme **"The Future We
Choose"** (Luma event page and Harvard SEAS calendar). Guiding question:
"What future will we choose to build?" Full day with talks, Discovery
Sessions, dine-around dinners and a startup showcase. Luma shows it **sold
out, 373 attended**.

**Before Edition 1: October 25, 2024**, a TEDxLive event ("TEDxHarvard Square
Live") at the same 33 Dunster St address. The old Webflow site called
Against Entropy "Edition 4", so the old count included it. The owner's
numbering starts at April 2025. See D3.

Sources: TED event listings 59961, 67861 and 60289; luma.com/zkv4w3w1;
events.seas.harvard.edu "TEDx Harvard Square – The Future We Choose";
harvardsquare.com/places/tedx-harvard-square.

---

## 5. Decisions (owner, 2026-10-12)

- **D1.** A section on `/flagship`, not a separate page. **Built.**
- **D2.** No menu link.
- **D3.** The Oct 2024 TEDxLive stays out. (The owner didn't recognise it.
  It is only on TED's event list, and our numbering starts at April 2025.)
- **D4.** Edition 2 theme is "The Future We Choose" (set in Studio). Edition 1
  had a theme; the owner is finding it.
- **D5.** Attendance left empty. Luma's 373 is a floor; the room was closer
  to 400 with extra guests, so there's no exact count to show.

Built on branch `flagship-over-the-years`: the section, the `recap` and
`attendance` fields (edition → Over the years tab), `getPastEditions()`,
`endDate` in the Event JSON-LD, and a scroll margin on `/speakers`'
edition anchors (the ids already existed). The panel photo falls back from
Poster to the edition's first talk stage photo; Edition 1 has neither, so it
shows its number on black.
