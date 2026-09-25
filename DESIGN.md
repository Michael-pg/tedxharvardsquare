# TEDxHarvardSquare — Design System

The rules that keep this site feeling like one piece of work. Read this before
designing or building any page or component. Tokens live in
`src/app/globals.css` (`@theme`); this file explains how to use them.

When this file and the code disagree, fix one of them in the same PR.

---

## 1. Principles

1. **Restraint is the brand.** The 3D work and the photography supply the
   energy. Everything around them — type, colour, layout — stays quiet.
2. **Typography carries the hierarchy.** Size, weight, and space do the work
   that boxes, borders, and colour do on lesser sites. No card-grid-by-default.
3. **Flagship and House have equal weight.** The annual conference and the
   year-round programme are both first-class. Neither is a footnote.
4. **Real or nothing.** Real photography, real people, real copy. A missing
   field renders as absence, never as a plausible fake. Placeholder people
   survive to production.
5. **Every page is sponsor-facing.** Assume a partner's brand team is reading.
   Precision over flourish; nothing broken, nothing cheap.

---

## 2. Brand

**Name:** `TEDxHarvardSquare` — one word, in running text. The programmes are
**Flagship** (the annual conference, numbered as **Edition 4** etc.) and
**House** (year-round events). Never "Community".

**Logo:** the TEDx wordmark lockup, set in **Helvetica Neue** — the only place
that face is used. Use the supplied artwork (white on dark, black on light);
never re-typeset, recolour, stretch, or animate it. SVG preferred.

**TEDx licence:** TED licenses the name and has strict rules on logo use,
sponsor recognition, and event naming. Anything touching the logo, sponsors,
or the event name must be checked against the current TEDx rules before it
ships. Open question: the Partner schema's **"Presenting"** tier — TEDx rules
are believed to prohibit "presented by" sponsorship; verify before any sponsor
is labelled with it.

---

## 3. Colour

TEDx red is the **only** chromatic value. Everything else is the neutral ink
ramp. Photography and the 3D scene are the only other sources of colour.

| Token | Hex | Role |
| --- | --- | --- |
| `brand` | `#EB0028` | TEDx red. Signal, not decoration. |
| `brand-dim` | `#B8001F` | Pressed/active states only. Never text. |
| `ink-950` (`background`) | `#08080A` | Page background. |
| `ink-900` / `ink-800` | `#0E0E11` / `#17171C` | Raised surfaces (dialogs, image wells). |
| `ink-700` (`rule`) | `#232329` | Hairlines and dividers. |
| `ink-500` | `#5C5C68` | Borders on hover. Never text. |
| `ink-400` (`muted`) | `#85858F` | Secondary text, metadata. |
| `ink-300` / `ink-200` | `#ADADB6` / `#D2D2D8` | Supporting and body copy. |
| `ink-50` (`foreground`) | `#F7F7F9` | Primary text. |

### Contrast (measured, WCAG 2.2)

| Text | on `ink-950` | Allowed for |
| --- | --- | --- |
| `foreground`, `ink-200`, `ink-300` | 18.7 / 13.3 / 9.0 | All text |
| `muted` (`ink-400`) | 5.5 | All text |
| `brand` | **4.35** | **Large text only** — ≥ 24px, or ≥ 18.7px bold |
| `ink-500` and darker | ≤ 3.0 | Never text |

### Rules

- **Red text only at large sizes.** `text-brand` on `text-label`, `text-small`,
  or `text-body` fails AA. For small signals use a red *mark* (dot, rule,
  underline) beside `foreground` text instead. (Known violations — see
  `docs/PROGRESS.md`.)
- **One red moment per viewport.** If two things are red, neither is.
- Hover/focus colour changes must also meet contrast; the focus ring is the
  2px `brand` outline from `globals.css` (non-text, 3:1 is sufficient).
- No other hues, no gradients in UI. Tints come only from opacity on the ink
  ramp (`bg-white/8` glass, `backdrop:bg-ink-950/85`).

---

## 4. Typography

**Figtree** for everything on the site (`src/lib/fonts.ts`). **Helvetica Neue**
for the logo only.

| Token | Size (fluid) | Use |
| --- | --- | --- |
| `text-hero` | 48 → 152px | The one hero line per page. |
| `text-display` | 36 → 72px | Page titles (`h1` on inner pages). |
| `text-title` | 28 → 44px | Section titles, dialog names. |
| `text-heading` | 20 → 24px | Item titles: speakers, questions. |
| `text-lead` | 18 → 22px | Intros, talk titles in detail views. |
| `text-body` | 16px | Body copy. |
| `text-small` | 14px | Captions, secondary actions. |
| `text-label` | 12px, +0.12em, uppercase | Eyebrows and metadata. |

- Weights: `font-medium` for headings, regular for everything else. No bold
  body copy, no italics except in quoted titles.
- One `h1` per page. Headings use `text-balance`.
- Prose measure ≤ ~70 characters (`max-w-3xl`).
- **No arbitrary values** (`text-[17px]`). Missing a size? Add it to the ramp.

---

## 5. Layout & spacing

- **Gutters:** `px-6` (24px) on every page, at every width. The header uses the same gutter so the lockup lines up with page content.
- **Inner page header:** `pt-40 md:pt-56`, eyebrow → `h1` → lead, then
  `mb-20 md:mb-28` before content.
- **Sections:** `py-24 md:py-40`, separated by `border-t border-rule`.
- **Widths:** headers `max-w-4xl`, lists `max-w-5xl`, prose `max-w-3xl`.
- **Grids:** 1 → 2 (`sm`) → 3 (`lg`) columns; `gap-x-8 gap-y-16`. Use a grid
  only when items are genuinely parallel (a lineup); otherwise, a list.
- Generous vertical space is the default. When unsure, add space, not lines.

---

## 6. Imagery

- **Real event photography only.** Stage photos lead; audience photos support.
- **Speaker portraits:** 4:5, `object-cover`, **greyscale → colour** on
  hover/focus. Consistent crop, face in the upper third.
- **Hero sequence:** exactly **six landscape** photos (the scroll timing and
  frame width are tuned for this). Managed in Studio → Home page.
- **Sponsor logos:** use the `logoOnDark` (white) variant on this site.
- **Alt text** (required on every image):
  - Photos — describe what is visible and what is happening, one sentence.
    Don't name people unless the image is about that person; don't guess
    emotions or identities.
  - Portraits — `Portrait of {Name}`.
  - Logos — `{Name} logo`.
  - Purely decorative — empty alt, and only then.

---

## 7. Motion

- GSAP only, imported from `@/lib/gsap`. Reach for `<Reveal>` and
  `<SplitReveal>` before writing a bespoke tween.
- **Durations:** `fast` 0.3s (hovers, toggles) · `base` 0.6s (entrances,
  panels) · `slow` 1.2s (hero moments). **Easing:** `power3.out` default,
  `expo.out` for arrivals, `power2.inOut` for open/close.
- Motion should suggest, not shove: entrance travel ≤ 24px.
- **One scroll-driven set piece per page** (the home hero is the only pinned
  sequence today). Everything else reveals once and stays still.
- Animate `transform` and `opacity`; height only for disclosure (accordion).
- **`prefers-reduced-motion` is mandatory:** skip creating tweens; content
  must be fully visible without JS.

---

## 8. Components

| Component | Where | Notes |
| --- | --- | --- |
| `Nav` | `components/site/nav.tsx` (render via `SiteNav`) | Lockup left, glass pill right (Flagship · House · Speakers + menu). Lockup and pill turn dark over sections tagged `data-nav-theme="light"`. Full-screen menu wipes down: photo left (per-link on hover, set in Studio → Site settings → Menu images), large key pages, small secondary pages. |
| `SiteFooter` | `components/site/site-footer.tsx` | Sign-up CTA (early access + Substack), link columns, Cambridge clock / back to top / ©, the TEDx licence line (required wording), then the full-width lockup over `FooterGlow` — a 2D-canvas red halftone that rises from the bottom and swells under the pointer. Render on every page after `</main>`. |
| `GlassButton` | `components/ui/glass-button.tsx` | Only over the WebGL layer. |
| `Reveal` / `SplitReveal` | `components/motion/` | Default entrances. |
| `SpeakerArchive` | `components/speakers/` | Year tabs, portrait cards, detail dialog with YouTube embed, `#slug` deep links. |
| `FaqAccordion` | `components/faq/` | Independent items; closed answers are `inert`. |

Shared patterns:

- **Pill controls** (tabs, link chips): `rounded-full border`, selected state
  inverts to `bg-foreground text-background`.
- **Inline links:** `underline decoration-rule underline-offset-4`, decoration
  turns `brand` on hover.
- **Dialogs:** native `<dialog>`, `ink-900` panel, `border-rule`, close on
  button, Escape, and backdrop click. Below `md` they become a full-screen
  sheet that slides up, with the close button fixed top-right.

---

## 9. Voice

- Confident, plain, specific. Short sentences. No hype words ("revolutionary",
  "world-class"), no exclamation marks.
- Eyebrows are nouns or short phrases ("The archive", "Flagship"), not
  sentences.
- Numbers as figures: "Edition 4", "300+ founders".

---

## 10. Ship checklist (every page)

- [ ] Uses only ramp tokens — no arbitrary values.
- [ ] Contrast passes (no small red text).
- [ ] Every image has correct alt text.
- [ ] Keyboard: every control reachable, visible focus, dialogs trap and restore focus.
- [ ] Reduced motion: no tweens created, nothing left hidden.
- [ ] Works at 375px and 1440px+.
- [ ] Content comes from `@/content` (Sanity); empty fields render as absence.
- [ ] Page has a unique `title` and `description`.
- [ ] Checked in the browser, not just built.
