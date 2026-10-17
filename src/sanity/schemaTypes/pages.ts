import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";
import { CircleHelp, FileText, Handshake, House, Mic, Sparkles, Sofa } from "lucide-react";

/**
 * One document per page, each listed under Pages in the sidebar. Fields run in
 * the order they appear as you scroll the page, grouped into one section per
 * band of the page. They hold the page's own words (headings, intros, button
 * labels); the content they frame (editions, speakers, events, FAQs, partners)
 * keeps its own documents.
 *
 * Every text field falls back to the wording in `src/content/page-copy.ts`
 * when left empty, so clearing a field never blanks the page. Text the TEDx
 * licence fixes word for word is not editable here.
 */

const EMPTY_FALLS_BACK = "Leave a field empty to use the site's default wording.";

/** A heading, intro or button label: a one-line string, or `rows` for a paragraph. */
export const copyField = (
  name: string,
  title: string,
  description: string,
  { rows, fieldset, group }: { rows?: number; fieldset?: string; group?: string } = {},
): FieldDefinition =>
  defineField({
    name,
    title,
    description,
    fieldset,
    group,
    ...(rows ? { type: "text", rows } : { type: "string" }),
  });

const section = (name: string, title: string, description?: string) => ({
  name,
  title,
  description,
  options: { collapsible: true, collapsed: false },
});

const seoField = defineField({
  name: "seoDescription",
  title: "Search description",
  type: "text",
  rows: 3,
  fieldset: "seo",
  description: "What search engines and link previews show under the page title. One or two sentences.",
});
const seoSection = section("seo", "Search & sharing");

export const homePage = defineType({
  name: "homePage",
  title: "Home",
  type: "document",
  icon: House,
  description: `The home page, top to bottom. ${EMPTY_FALLS_BACK}`,
  fieldsets: [
    section("hero", "Hero", "The first screen. The headline and the line under it are the current edition's theme and theme statement (Flagship → Editions)."),
    section("motto", "Motto", "The statement lit word by word as visitors scroll, then the photos that fly past."),
    section("flagship", "Flagship", "The current edition. Its name, date and venue come from the edition."),
    section("talks", "Past talks"),
    section("library", "Not shown yet"),
  ],
  fields: [
    copyField("heroSubscribeLabel", "Subscribe button", "Opens the newsletter sign-up link (Site settings → Contact & social).", { fieldset: "hero" }),
    copyField("heroFlagshipLabel", "Flagship button", "Links to the Flagship page.", { fieldset: "hero" }),
    copyField(
      "motto",
      "Motto",
      "Its first sentence is set large, broken at its commas; the rest runs smaller beneath. Keep it to two or three sentences.",
      { fieldset: "motto", rows: 4 },
    ),
    defineField({
      name: "heroImages",
      title: "Photos",
      type: "array",
      fieldset: "motto",
      of: [defineArrayMember({ type: "accessibleImage" })],
      description:
        "The photographs that fly past under the motto, in order. The animation is timed for exactly six, and landscape photos frame best. They also stand in for any empty menu photo.",
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "flagshipPhoto",
      title: "Photo",
      type: "accessibleImage",
      fieldset: "flagship",
      description:
        "One speaker, lit, against a dark stage: the black melts into the page. Layered over a red halftone copy of itself. If empty, the second photo above is used.",
    }),
    copyField("flagshipSubscribeLabel", "Subscribe button", "Beside the button to the edition, which is named after its theme.", { fieldset: "flagship" }),
    copyField("talksHeading", "Heading", "The count of talks under it is worked out from the archive.", { fieldset: "talks" }),
    copyField("talksLinkLabel", "Button", "Links to the Speakers page.", { fieldset: "talks" }),
    defineField({
      name: "featuredTalks",
      title: "Talks",
      type: "array",
      fieldset: "talks",
      of: [defineArrayMember({ type: "reference", to: [{ type: "talk" }] })],
      description:
        "Up to four, in order. Each row shows the talk's stage photo (set on the talk itself), so pick talks that have one. If empty, talks with a stage photo and a video are picked automatically.",
      validation: (r) => r.max(4).unique(),
    }),
    defineField({
      name: "photoLibrary",
      title: "Photo library",
      type: "array",
      fieldset: "library",
      of: [defineArrayMember({ type: "accessibleImage" })],
      description: "Other home-page photography, kept here for upcoming sections.",
    }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});

export const flagshipPage = defineType({
  name: "flagshipPage",
  title: "Flagship",
  type: "document",
  icon: Sparkles,
  description: `The Flagship page's own words. The edition's theme, date, venue, "The day" photos and what's included are on the edition itself (Flagship → Editions). ${EMPTY_FALLS_BACK}`,
  fieldsets: [
    section("hero", "Hero"),
    section("speakers", "Speakers"),
    section("venue", "Venue & tickets", "The ticket ask sits beside the venue, or on its own once the venue is TBA."),
    section("editions", "Over the years"),
    section("connections", "Connections", "After Over the years. The edition's audience photo, if set, sits beside it."),
  ],
  fields: [
    copyField("title", "Title", "The large word along the bottom of the first screen.", { fieldset: "hero" }),
    copyField(
      "earlyAccessLabel",
      "Early-access button",
      "Shown until the edition has a ticket link, here and in The day and the closing ask. Opens the newsletter sign-up link.",
      { fieldset: "hero" },
    ),
    copyField("ticketsLabel", "Tickets button", "Replaces the early-access button once the edition has a ticket link.", { fieldset: "hero" }),
    copyField("speakersHeading", "Heading", "The edition's year is set beside it.", { fieldset: "speakers" }),
    copyField(
      "lineupNote",
      "Until the lineup is announced",
      "The line under the placeholder portraits. The edition's own Speakers note, if set, takes its place.",
      { fieldset: "speakers" },
    ),
    copyField("notifyLabel", "Notify button", "Opens the newsletter sign-up link.", { fieldset: "speakers" }),
    copyField("pastTalksLabel", "Past talks button", "Links to the Speakers page.", { fieldset: "speakers" }),
    copyField("mapsLabel", "Map button", "Opens the venue's address in Maps.", { fieldset: "venue" }),
    copyField("ticketsHeading", "Tickets heading", "Shown only when the venue is not yet announced.", { fieldset: "venue" }),
    copyField(
      "notOnSale",
      "Not on sale yet",
      "Shown in place of the edition's \"What's included\" list until that is filled in.",
      { fieldset: "venue", rows: 2 },
    ),
    copyField("questionsLabel", "Questions button", "Links to the FAQ.", { fieldset: "venue" }),
    copyField("editionsHeading", "Heading", "", { fieldset: "editions" }),
    copyField("editionsIntro", "Intro", "", { fieldset: "editions", rows: 2 }),
    copyField("watchTalksLabel", "Button on each edition", "Links to that edition on the Speakers page.", { fieldset: "editions" }),
    copyField("connectionsHeading", "Heading", "", { fieldset: "connections" }),
    copyField("connectionsBody", "Text", "", { fieldset: "connections", rows: 4 }),
    copyField("connectionsHouseTitle", "House link", "Links to the House page.", { fieldset: "connections" }),
    copyField("connectionsHouseBody", "House link: text", "", { fieldset: "connections" }),
    copyField("connectionsSponsorTitle", "Partner link", "Links to the Sponsor page.", { fieldset: "connections" }),
    copyField("connectionsSponsorBody", "Partner link: text", "", { fieldset: "connections" }),
    copyField("connectionsListTitle", "Newsletter link", "Opens the newsletter sign-up link.", { fieldset: "connections" }),
    copyField("connectionsListBody", "Newsletter link: text", "", { fieldset: "connections" }),
  ],
  preview: { prepare: () => ({ title: "Flagship" }) },
});

export const housePage = defineType({
  name: "housePage",
  title: "House",
  type: "document",
  icon: Sofa,
  description: `The House page's own words. The events are under House in the sidebar. ${EMPTY_FALLS_BACK}`,
  fieldsets: [
    section("header", "Header"),
    section("about", "What House is", "A short passage. The photographs on this page come from past event photos already in Studio, not from this document."),
    section("upcoming", "Upcoming"),
    section("past", "Past"),
    section("follow", "Follow", "The closing ask. The buttons open the Luma calendar and newsletter links (Site settings → Contact & social)."),
    seoSection,
  ],
  fields: [
    copyField("title", "Title", "", { fieldset: "header" }),
    copyField("intro", "Intro", "", { fieldset: "header", rows: 4 }),
    copyField("whatHeading", "Heading", "", { fieldset: "about" }),
    copyField("whatBody", "Text", "Describe the formats in general terms; name specific events under House in the sidebar.", { fieldset: "about", rows: 3 }),
    copyField("upcomingHeading", "Heading", "", { fieldset: "upcoming" }),
    copyField("emptyHeading", "When nothing is announced", "Shown in place of the list when no upcoming event is in Studio.", { fieldset: "upcoming" }),
    copyField("emptyBody", "When nothing is announced: text", "", { fieldset: "upcoming", rows: 2 }),
    copyField("calendarLabel", "Luma button", "Shown when events are listed. Opens the Luma calendar link (Site settings → Contact & social).", { fieldset: "upcoming" }),
    copyField("followLabel", "Luma button, when nothing is announced", "", { fieldset: "upcoming" }),
    copyField("subscribeLabel", "Subscribe button", "Opens the newsletter sign-up link.", { fieldset: "upcoming" }),
    copyField("pastHeading", "Heading", "Shown once an event has gone by.", { fieldset: "past" }),
    copyField("followHeading", "Heading", "", { fieldset: "follow" }),
    copyField("followBody", "Text", "", { fieldset: "follow", rows: 2 }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "House" }) },
});

export const speakersPage = defineType({
  name: "speakersPage",
  title: "Speakers",
  type: "document",
  icon: Mic,
  description: `The Speakers page's own words. Speakers and talks are under Flagship in the sidebar. ${EMPTY_FALLS_BACK}`,
  fieldsets: [
    section("header", "Header"),
    section("next", "Next edition", "Shown until the next edition's lineup is in the archive. Its name, date and venue come from the edition."),
    section("archive", "Archive"),
    seoSection,
  ],
  fields: [
    copyField("title", "Title", "", { fieldset: "header" }),
    copyField("intro", "Intro", "", { fieldset: "header", rows: 4 }),
    copyField("lineupNote", "Until the lineup is announced", "The edition's own Speakers note, if set, takes its place.", { fieldset: "next" }),
    copyField("flagshipLabel", "Button", "Links to the Flagship page.", { fieldset: "next" }),
    copyField("alsoOnStageHeading", "Performers heading", "Above each edition's performers.", { fieldset: "archive" }),
    copyField("emptyArchive", "When the archive is empty", "", { fieldset: "archive" }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Speakers" }) },
});

export const sponsorPage = defineType({
  name: "sponsorPage",
  title: "Sponsor",
  type: "document",
  icon: Handshake,
  description: `The pitch on /sponsor. Partner logos come from Partners; the email from Site settings → Contact & social. The note under the button is fixed by the TEDx licence. ${EMPTY_FALLS_BACK}`,
  fieldsets: [
    section("header", "Header"),
    section("pitch", "Pitch"),
    section("partners", "Our partners"),
    section("ask", "The ask"),
    seoSection,
  ],
  fields: [
    defineField({
      name: "headline",
      type: "string",
      fieldset: "header",
      description: "The large opening line, e.g. \"Ideas worth spreading need people willing to back them.\"",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      type: "accessibleImage",
      fieldset: "header",
      description: "A wide photo under the headline. If empty, the menu's Sponsor photo is used.",
    }),
    defineField({
      name: "body",
      title: "Pitch",
      type: "array",
      fieldset: "pitch",
      of: [{ type: "text", rows: 4 }],
      description: "Who the audience is and what partnering offers. One paragraph each; the first is set larger.",
    }),
    defineField({
      name: "photos",
      title: "Pitch photos",
      type: "array",
      fieldset: "pitch",
      of: [defineArrayMember({ type: "accessibleImage" })],
      description:
        "Two photos set beside the pitch paragraphs, in colour: the first upright beside the opening paragraph, the second wide beside the rest. The audience and the room work best. Until filled, two of the home page's photos stand in.",
      validation: (r) => r.max(2),
    }),
    copyField("partnersHeading", "Heading", "Shown once a partner has a logo.", { fieldset: "partners" }),
    copyField("partnersIntro", "Intro", "", { fieldset: "partners", rows: 2 }),
    copyField("ask", "Closing question", "The heading above the button.", { fieldset: "ask" }),
    copyField("ctaLabel", "Button", "Opens an email to the contact address in Site settings.", { fieldset: "ask" }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Sponsor" }) },
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About",
  type: "document",
  icon: FileText,
  description: `The opening of the About page. The About TEDx and About TED sections below it are required by the TEDx licence word for word, so they are not editable. ${EMPTY_FALLS_BACK}`,
  fieldsets: [
    section("header", "Header"),
    section("do", "What we do", "Two equal passages, Flagship and House."),
    section("team", "Team", "The people come from Team member documents in the sidebar (name and role). The section is hidden while that list is empty."),
    seoSection,
  ],
  fields: [
    copyField("title", "Title", "", { fieldset: "header" }),
    copyField("intro", "Intro", "Set large.", { fieldset: "header", rows: 4 }),
    copyField("body", "Text", "Set smaller, under the intro.", { fieldset: "header", rows: 4 }),
    copyField("doHeading", "Heading", "", { fieldset: "do" }),
    copyField("flagshipTitle", "Flagship title", "", { fieldset: "do" }),
    copyField("flagshipText", "Flagship text", "", { fieldset: "do", rows: 3 }),
    copyField("flagshipLabel", "Flagship link", "", { fieldset: "do" }),
    copyField("houseTitle", "House title", "", { fieldset: "do" }),
    copyField("houseText", "House text", "", { fieldset: "do", rows: 3 }),
    copyField("houseLabel", "House link", "", { fieldset: "do" }),
    copyField("teamHeading", "Heading", "", { fieldset: "team" }),
    copyField("teamIntro", "Intro", "", { fieldset: "team", rows: 2 }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "About" }) },
});

export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ",
  type: "document",
  icon: CircleHelp,
  description: `The FAQ page's own words. The questions are under FAQ in the sidebar. ${EMPTY_FALLS_BACK}`,
  fieldsets: [section("header", "Header"), section("contact", "Contact", "Pinned beside the questions."), seoSection],
  fields: [
    copyField("title", "Title", "", { fieldset: "header" }),
    copyField("intro", "Intro", "", { fieldset: "header", rows: 3 }),
    copyField("contactHeading", "Heading", "", { fieldset: "contact" }),
    copyField("contactBody", "Text", "", { fieldset: "contact", rows: 2 }),
    copyField("contactLabel", "Button", "Opens an email to the contact address in Site settings.", { fieldset: "contact" }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "FAQ" }) },
});

export const pageTypes = [homePage, flagshipPage, housePage, speakersPage, sponsorPage, aboutPage, faqPage];
