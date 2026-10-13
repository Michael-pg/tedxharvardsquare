# Flagship page: flow plan

Written 2026-10-12, from owner feedback: "very boxed out", "stacked really
heavy", Why come "feels basic". Speakers works; keep it. Approved by the owner
2026-10-12 (bento first; copy may be adjusted; nearly 400 attended, sold out;
the dot field returns as the closer).

---

## 1. What's wrong now

The page (after #71) runs: hero → statement → Why come → Speakers → venue →
Topics → Over the years → Tickets → footer.

1. **Every section is built the same way.** Big heading top left, a grey line
   top right, a block of content, then `py-32` of black. Seven times in a
   row. That sameness is the "stacked" feeling: nothing overlaps, nothing
   changes pace, every section is a box.
2. **Facts are scattered.** The date and venue are in the hero, again in the
   venue section four screens later, and the ask is at the very bottom. A
   visitor who wants "when, where, how much, what happens" has to scroll the
   whole page to assemble it.
3. **Why come is three equal tiles.** Three photos, three lines, same size.
   It reads as a template, and it says too little: nothing about the format
   (talks, Discovery Sessions, conversations), who comes, or the scale.
4. **Topics and Over the years are filler-shaped.** Both are a heading plus a
   list; neither is something you'd stop for.
5. **The page ends flat.** Tickets is one more heading-left section; there's
   no closing moment before the footer.

## 2. What good conference pages do

From TED, OFFF, Config and the conference-site guides:

- **Identity and the ask above the fold.** Name, theme, date, place, one
  action. (We have this. Keep it.)
- **Answer "what is it, why care, how to join" in the first two screens**,
  not spread across eight.
- **One primary action per screen**, repeated where the visitor decides,
  not only at the end.
- **Grids for scannable facts, scroll effects sparingly.** Bento suits a
  set of short, distinct facts of different weights; scroll storytelling
  suits one moment, not every section.
- **Common order:** hero → about → why attend → speakers → tickets → FAQ →
  close. Ours already roughly follows it; the problem is pace, not order.

## 3. Proposed flow

Six beats instead of nine, each a different shape, so the page breathes
in and out instead of stacking.

```
1  HERO                      full screen, dot field      (unchanged)
2  THE DAY  — bento          statement + facts + photos  (new; replaces statement + Why come)
3  SPEAKERS                  big names                   (unchanged)
4  TOPICS band               marquee strip, no heading   (lighter)
5  WHERE & WHEN              full-bleed venue + the ask  (venue + Tickets merged)
6  OVER THE YEARS + CLOSE    compact rows, then the dot field returns for one last ask
```

### Beat 2: The day (bento)

The theme statement and the value prop in one composed grid, about one and a
half screens tall. Tiles differ in size and kind; type tiles sit on bare
black (no borders, no boxes), photo tiles bleed to their edges.

```
┌──────────────────────────────────────┬────────────────────┐
│ It's easy to let things happen.      │                    │
│ It's harder to stop, see what isn't  │   PHOTO (tall)     │
│ working, and choose to build.        │   speaker on stage │
│                       (statement)    │                    │
├───────────────────┬──────────────────┤ 01 Ideas from      │
│ PHOTO (wide)      │ 1 day            │    outside your    │
│ workshop table    │ Feb 20, 2027     │    field           │
│                   │ Arrow Street Arts├────────────────────┤
│ 02 More than talks│                  │ Scientists,        │
├───────────────────┴──────────────────┤ engineers, artists,│
│ Talks · Discovery Sessions ·         │ founders… (who     │
│ Conversations       (the format)     │ comes, set large)  │
├──────────────────────────────────────┼────────────────────┤
│ PHOTO (wide) full house  03 Leave    │ 12 talks last year │
│ with someone to build with           │ [Get early access] │
└──────────────────────────────────────┴────────────────────┘
```

Content is all real and already in Studio: the statement, the three reasons
and their photos, the audience line ("Scientists, engineers, entrepreneurs…",
currently hidden), the program line ("Talks, Discovery Sessions, and
conversations…", currently hidden), the date and venue, and the last
edition's real talk count. No invented figures.

Motion, one idea: the grid assembles as it scrolls in. Photo tiles open from a
thin slit (clip-path) while the image inside eases from 1.1 to 1 scale; type
tiles fade up after them, staggered across the grid. The statement keeps its
word-by-word blur in. Photos drift a few percent inside their tiles on scroll
(parallax inside the frame, never the frame itself, so nothing tilts or
shifts out of the grid). Reduced motion: everything simply there.

Phone: the bento collapses to two columns, statement first, photos and facts
alternating so it never becomes a single tall stack of the same thing.

### Beat 4: Topics as a band

Drop the "Topics" heading and its paragraph. The marquee runs as a single
strip between Speakers and the venue, a hairline above and below: kinetic,
one screen-height of nothing else. It becomes a transition instead of a
section.

### Beat 5: Where & when (venue + tickets merged)

Keep the full-bleed venue photo and the print-to-photo develop. Over it:
the date and venue huge (as now), and opposite them the address, getting
there, **and the ticket ask** (Get early access / Get tickets, what's
included once Studio has it). The separate Tickets section goes, since this is
the moment someone decides to come.

### Beat 6: Over the years, then the close

Over the years stays compact: the rows from #71, tighter (smaller photo, one
line of meta). Then the close: the dot field comes back (it stopped after
the hero), gathering behind one centred line and the button, e.g.
"Edition 03. February 20, 2027." + Get early access. The page ends the way
it started, so the dots bookend it.

## 4. Rules this changes

- DESIGN.md §1/§5 say "no card-grid-by-default" and "grids only for parallel
  items". The bento is a deliberate exception for the facts of the day; it
  will be noted there as the one bento on the site.
- DESIGN.md §7 allows one scroll-driven set piece per page. On Flagship that
  becomes the bento assembling; the venue develop stays as it is (a reveal,
  not a scrubbed sequence).
- Studio: unhide **Who's in the room** and **Program text** (they feed the
  bento); the Tickets copy moves into the venue section, fields unchanged.

## 5. Order of work

1. ~~Bento component + Beat 2, with motion and the phone layout.~~ Done (`the-day.tsx`).
2. ~~Topics band, venue + tickets merge.~~ Done.
3. Over the years tightening and the dot-field close. Review.

Each step is its own PR, previewed before merge.

## 6. Open questions for the owner

1. Bento tiles: OK to bring back the audience line and the program line from
   Studio as written, or rewrite them?
2. "12 talks last year" is the only real figure we have. Any others you can
   stand behind (attendance, sold out, number of Discovery Sessions)?
3. Ending: dot field returning behind the final ask, or end on Over the years
   and let the footer's glow be the close?

Sources: [Dryfta, conference website elements](https://dryfta.com/12-design-elements-for-a-terrific-conference-website-in-2026/),
[Bizzabo, event websites](https://www.bizzabo.com/blog/10-beautifully-designed-event-websites),
[Ceros, conference landing page](https://www.ceros.com/templates/conference-landing-page/),
[LOOP 2026 concept](https://contra.com/p/Y2gNA7Og-loop-2026-conference-landing-page),
[OFFF](https://offf.barcelona/), [Figma Config](https://config.figma.com/).
