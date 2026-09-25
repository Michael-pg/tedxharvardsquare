import { defineArrayMember, defineField, defineType } from "sanity";
import {
  CalendarDays,
  CircleHelp,
  Handshake,
  House,
  Megaphone,
  Mic,
  Settings,
  Tag,
  Users,
  Video,
} from "lucide-react";

/**
 * Document types. Each mirrors a type in `src/content/types.ts`. Where the
 * local model stores a `...Slug` string to point at another record, Sanity
 * stores a reference, and the GROQ projection flattens it back to the slug.
 *
 * Fields are optional wherever the historical record is incomplete — early
 * editions and migrated Webflow entries. Required-ness is reserved for things
 * the site genuinely cannot render without.
 */

const slugField = (source = "title") =>
  defineField({
    name: "slug",
    type: "slug",
    options: { source, maxLength: 96 },
    validation: (r) => r.required(),
  });

/** Manual sort position, for lists whose order is editorial rather than alphabetical. */
const orderField = defineField({
  name: "order",
  type: "number",
  description: "Position in the list. Lower numbers appear first.",
  validation: (r) => r.integer(),
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: Settings,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description: "Used for search results and link previews.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "missionStatement",
      title: "Mission statement",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({ name: "url", title: "Site URL", type: "url", validation: (r) => r.required() }),
    defineField({ name: "locale", type: "string", initialValue: "en-US" }),
    defineField({
      name: "social",
      title: "Social links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({ name: "newsletterUrl", title: "Newsletter URL", type: "url" }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "menuImages",
      title: "Menu images",
      type: "object",
      description:
        "Photographs for the full-screen menu. The general image shows when the menu opens; each page's image replaces it while that link is hovered. Empty slots fall back to the home-page hero photos.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "general", title: "General", type: "accessibleImage" }),
        defineField({ name: "flagship", title: "Flagship", type: "accessibleImage" }),
        defineField({ name: "house", title: "House", type: "accessibleImage" }),
        defineField({ name: "speakers", title: "Speakers", type: "accessibleImage" }),
        defineField({ name: "sponsor", title: "Sponsor", type: "accessibleImage" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: House,
  fields: [
    defineField({
      name: "heroImages",
      title: "Hero images",
      type: "array",
      of: [defineArrayMember({ type: "accessibleImage" })],
      description:
        "The photographs that fly through the hero on scroll, in order. The animation is timed for exactly six, and landscape photos frame best.",
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "photoLibrary",
      title: "Photo library",
      type: "array",
      of: [defineArrayMember({ type: "accessibleImage" })],
      description:
        "Other home-page photography, kept here for upcoming sections. Not shown on the site yet.",
    }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});

export const edition = defineType({
  name: "edition",
  title: "Edition",
  type: "document",
  icon: Megaphone,
  fields: [
    defineField({
      name: "number",
      type: "number",
      description: 'Sequential number as the org counts them — "Edition 4".',
      validation: (r) => r.required().integer().positive(),
    }),
    defineField({
      name: "year",
      type: "number",
      description: "The calendar year it took place. Speakers are grouped by this.",
      validation: (r) => r.required().integer().min(2020).max(2100),
    }),
    defineField({
      name: "theme",
      type: "string",
      description: 'The year-defining theme, e.g. "Against Entropy".',
    }),
    slugField("theme"),
    defineField({
      name: "themeStatement",
      title: "Theme statement",
      type: "text",
      rows: 3,
      description: "One-paragraph framing of what the theme asks of the audience.",
    }),
    defineField({
      name: "date",
      type: "date",
      description: "Leave empty if only the month or year is on record.",
    }),
    defineField({ name: "venue", type: "venue" }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Announced", value: "announced" },
          { title: "Upcoming", value: "upcoming" },
          { title: "Past", value: "past" },
        ],
        layout: "radio",
      },
      initialValue: "announced",
      validation: (r) => r.required(),
    }),
    defineField({ name: "ticketUrl", title: "Ticket URL", type: "url" }),
    defineField({ name: "poster", type: "accessibleImage" }),
  ],
  orderings: [
    { title: "Newest first", name: "numberDesc", by: [{ field: "number", direction: "desc" }] },
  ],
  preview: {
    select: { number: "number", theme: "theme", year: "year", media: "poster" },
    prepare: ({ number, theme, year, media }) => ({
      title: `Edition ${number ?? "?"}${theme ? ` · ${theme}` : ""}`,
      subtitle: year ? String(year) : undefined,
      media,
    }),
  },
});

export const speaker = defineType({
  name: "speaker",
  title: "Speaker",
  type: "document",
  icon: Mic,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({
      name: "kind",
      type: "string",
      options: {
        list: [
          { title: "Speaker", value: "speaker" },
          { title: "Performer", value: "performer" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "speaker",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "track",
      type: "string",
      description: "Which programme they appeared in.",
      options: {
        list: [
          { title: "Flagship", value: "flagship" },
          { title: "House", value: "house" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "flagship",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "edition",
      type: "reference",
      to: [{ type: "edition" }],
      description: "Required for Flagship speakers.",
      validation: (r) =>
        r.custom((value, context) =>
          !value && (context.document as { track?: string } | undefined)?.track === "flagship"
            ? "Flagship speakers need an edition."
            : true,
        ),
    }),
    defineField({
      name: "title",
      type: "string",
      description: 'Professional title, e.g. "Neuroscientist".',
    }),
    defineField({ name: "organization", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 6 }),
    defineField({
      name: "credit",
      type: "string",
      description: 'Performers only — e.g. "Accompanied by Julian Oliver".',
      hidden: ({ document }) => document?.kind !== "performer",
    }),
    defineField({ name: "headshot", type: "accessibleImage" }),
    defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] }),
    orderField,
  ],
  orderings: [
    { title: "Lineup order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "title", year: "edition.year", media: "headshot" },
    prepare: ({ title, subtitle, year, media }) => ({
      title,
      subtitle: [year, subtitle].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const talk = defineType({
  name: "talk",
  title: "Talk",
  type: "document",
  icon: Video,
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slugField(),
    defineField({
      name: "premise",
      type: "text",
      rows: 2,
      description: "The one-sentence idea worth spreading.",
    }),
    defineField({
      name: "speaker",
      type: "reference",
      to: [{ type: "speaker" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "edition", type: "reference", to: [{ type: "edition" }] }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "Canonical TED.com or YouTube URL. Leave empty until the talk is published.",
    }),
    defineField({
      name: "durationSeconds",
      title: "Duration (seconds)",
      type: "number",
      validation: (r) => r.integer().positive(),
    }),
    defineField({
      name: "topics",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
    }),
  ],
  preview: { select: { title: "title", subtitle: "speaker.name" } },
});

export const topic = defineType({
  name: "topic",
  title: "Topic",
  type: "document",
  icon: Tag,
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    slugField("label"),
  ],
  orderings: [{ title: "A–Z", name: "labelAsc", by: [{ field: "label", direction: "asc" }] }],
  preview: { select: { title: "label" } },
});

export const houseEvent = defineType({
  name: "houseEvent",
  title: "House event",
  type: "document",
  icon: CalendarDays,
  description: "Year-round programming — mixers, dinners, AMAs, salons, workshops.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slugField(),
    defineField({
      name: "tagline",
      type: "string",
      description: "One line, shown on cards.",
    }),
    defineField({
      name: "format",
      type: "string",
      options: {
        list: [
          { title: "Mixer", value: "mixer" },
          { title: "Founder Dinner", value: "founder-dinner" },
          { title: "AMA", value: "ama" },
          { title: "Salon", value: "salon" },
          { title: "Hackathon", value: "hackathon" },
          { title: "Workshop", value: "workshop" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "venue", type: "venue" }),
    defineField({
      name: "registrationUrl",
      title: "RSVP link",
      type: "url",
      description: "Luma or other ticketing URL.",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Upcoming", value: "upcoming" },
          { title: "Past", value: "past" },
        ],
        layout: "radio",
      },
      initialValue: "upcoming",
      validation: (r) => r.required(),
    }),
    defineField({ name: "coverImage", title: "Cover image", type: "accessibleImage" }),
    defineField({
      name: "gallery",
      type: "array",
      of: [defineArrayMember({ type: "accessibleImage" })],
    }),
    defineField({
      name: "attendeeCount",
      title: "Attendee count",
      type: "number",
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: "keyQuote",
      title: "Key quote",
      type: "text",
      rows: 2,
      description: "A standout line from the event, for the recap card.",
    }),
  ],
  orderings: [{ title: "Date", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "date", media: "coverImage" } },
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: CircleHelp,
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    slugField("question"),
    defineField({ name: "answer", type: "text", rows: 6, validation: (r) => r.required() }),
    orderField,
  ],
  orderings: [{ title: "Page order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "question", subtitle: "answer" } },
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  icon: Users,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "role", type: "string", validation: (r) => r.required() }),
    defineField({ name: "headshot", type: "accessibleImage" }),
    defineField({
      name: "isLicensee",
      title: "TEDx licensee",
      type: "boolean",
      description: "Organizers who hold the TEDx licence — the distinction matters to TED.",
      initialValue: false,
    }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "headshot" } },
});

export const partner = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  icon: Handshake,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({
      name: "tier",
      type: "string",
      options: {
        list: [
          { title: "Presenting", value: "presenting" },
          { title: "Supporting", value: "supporting" },
          { title: "Community", value: "community" },
          { title: "In-kind", value: "in-kind" },
        ],
      },
    }),
    defineField({ name: "logo", type: "accessibleImage" }),
    defineField({
      name: "logoOnDark",
      title: "Logo (for dark backgrounds)",
      type: "accessibleImage",
      description: "A white or single-colour version. The site is dark, so this is the one shown.",
    }),
    defineField({ name: "url", title: "Website", type: "url" }),
  ],
  preview: { select: { title: "name", subtitle: "tier", media: "logo" } },
});
