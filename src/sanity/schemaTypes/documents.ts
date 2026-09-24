import { defineArrayMember, defineField, defineType } from "sanity";
import {
  CalendarDays,
  Handshake,
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
 */

const slugField = (source = "title") =>
  defineField({
    name: "slug",
    type: "slug",
    options: { source, maxLength: 96 },
    validation: (r) => r.required(),
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
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
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
      name: "theme",
      type: "string",
      description: 'The year-defining theme, e.g. "Against Entropy".',
      validation: (r) => r.required(),
    }),
    slugField("theme"),
    defineField({
      name: "themeStatement",
      title: "Theme statement",
      type: "text",
      rows: 3,
      description: "One-paragraph framing of what the theme asks of the audience.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", type: "date", validation: (r) => r.required() }),
    defineField({ name: "venue", type: "venue", validation: (r) => r.required() }),
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
    select: { number: "number", theme: "theme", date: "date", media: "poster" },
    prepare: ({ number, theme, date, media }) => ({
      title: `Edition ${number ?? "?"} · ${theme ?? "Untitled"}`,
      subtitle: date,
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
      name: "title",
      type: "string",
      description: 'Professional title, e.g. "Neuroscientist".',
      validation: (r) => r.required(),
    }),
    defineField({ name: "organization", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 6, validation: (r) => r.required() }),
    defineField({ name: "headshot", type: "accessibleImage" }),
    defineField({
      name: "edition",
      type: "reference",
      to: [{ type: "edition" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] }),
  ],
  preview: { select: { title: "name", subtitle: "title", media: "headshot" } },
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: "speaker",
      type: "reference",
      to: [{ type: "speaker" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "edition",
      type: "reference",
      to: [{ type: "edition" }],
      validation: (r) => r.required(),
    }),
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

export const communityEvent = defineType({
  name: "communityEvent",
  title: "Community event",
  type: "document",
  icon: CalendarDays,
  description: "Year-round programming — salons, workshops, meetups, screenings.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slugField(),
    defineField({ name: "description", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({
      name: "kind",
      type: "string",
      options: {
        list: [
          { title: "Salon", value: "salon" },
          { title: "Workshop", value: "workshop" },
          { title: "Meetup", value: "meetup" },
          { title: "Screening", value: "screening" },
          { title: "Volunteer", value: "volunteer" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "venue", type: "venue", validation: (r) => r.required() }),
    defineField({ name: "registrationUrl", title: "Registration URL", type: "url" }),
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
  ],
  orderings: [{ title: "Date", name: "dateAsc", by: [{ field: "date", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "date" } },
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
      validation: (r) => r.required(),
    }),
    defineField({ name: "logo", type: "accessibleImage" }),
    defineField({ name: "url", title: "Website", type: "url" }),
  ],
  preview: { select: { title: "name", subtitle: "tier", media: "logo" } },
});
