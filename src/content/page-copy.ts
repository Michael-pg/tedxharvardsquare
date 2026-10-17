/**
 * The words on each page that are not content in their own right: headings,
 * intros and button labels. Each page has a Studio document (Pages → …) with
 * one field per key, in the order they appear as you scroll. These are the
 * defaults: a field left empty in Studio falls back to its value here, and
 * `scripts/seed-page-copy.ts` filled Studio with them.
 *
 * Text the TEDx licence fixes word for word ("What is TEDx?", About TEDx and
 * About TED, the partners note on /sponsor) is not here and stays in code.
 *
 * Plain data, not server-only, so the seed script can import it.
 */

export const pageCopy = {
  homePage: {
    heroSubscribeLabel: "Subscribe",
    heroFlagshipLabel: "Explore Flagship",
    motto:
      "The right idea, heard by the right person, at the right moment, can change the course of a life, a company, or a policy. We exist to create those moments, on stage and in every room we build year-round.",
    flagshipSubscribeLabel: "Subscribe",
    talksHeading: "Watch past talks",
    talksLinkLabel: "All speakers and talks",
  },
  flagshipPage: {
    title: "Flagship",
    earlyAccessLabel: "Get early access",
    ticketsLabel: "Get tickets",
    speakersHeading: "Speakers",
    lineupNote: "Lineup coming soon.",
    notifyLabel: "Get notified",
    pastTalksLabel: "Watch past talks",
    mapsLabel: "Open in Maps",
    ticketsHeading: "Tickets",
    notOnSale: "Tickets are not on sale yet. Join the early-access list to hear first.",
    questionsLabel: "Questions",
    editionsHeading: "Over the years",
    editionsIntro: "Every Flagship so far, and its talks.",
    watchTalksLabel: "Watch the talks",
    // Claude-drafted 2026-10-17, awaiting owner review.
    connectionsHeading: "The people in the room",
    connectionsBody:
      "The stage is one part of the day. The rest is the room: founders, researchers, artists and organizers who came to listen and stayed to talk. The conversations between sessions are often the ones that last.",
    connectionsHouseTitle: "Keep in touch through House",
    connectionsHouseBody: "Salons, founder dinners and workshops in Cambridge, between Flagships.",
    connectionsSponsorTitle: "Partner with us",
    connectionsSponsorBody: "Support the day and meet the people in the room.",
    connectionsListTitle: "Hear first",
    connectionsListBody: "Early access and announcements, by email.",
  },
  housePage: {
    title: "House",
    intro:
      "Our year-round programming. Salons, founder dinners, AMAs and workshops in Cambridge between Flagship editions, for a growing network of founders, scientists and leaders across Boston's innovation ecosystem.",
    upcomingHeading: "Upcoming",
    emptyHeading: "More to be announced.",
    emptyBody: "New House events go up on our Luma calendar first. Follow it to hear when the next one opens.",
    calendarLabel: "Full calendar on Luma",
    followLabel: "Follow on Luma",
    subscribeLabel: "Subscribe",
    pastHeading: "Past",
    // Drafted by Claude, awaiting owner review.
    whatHeading: "The rest of the year, in smaller rooms.",
    whatBody:
      "Between each Flagship, House keeps the conversation going with talks, salons and workshops in Cambridge. Rooms are small, so the people in them get to meet.",
    followHeading: "Hear about the next one first.",
    followBody: "New events go up on our Luma calendar first. The newsletter follows what happens in between.",
    seoDescription:
      "House is TEDxHarvardSquare's year-round programming in Cambridge: salons, founder dinners, AMAs and workshops between Flagship editions.",
  },
  speakersPage: {
    title: "Speakers",
    intro:
      "Hear from innovators working at the frontier of AI, biology, creativity, climate, culture, and human connection. These are blueprints for what flourishing could look like in the years ahead.",
    lineupNote: "Lineup to be announced.",
    flagshipLabel: "About the Flagship",
    alsoOnStageHeading: "Also on stage",
    emptyArchive: "The speaker archive is being assembled.",
    seoDescription:
      "Meet the innovators, scientists, founders, and leaders who have taken the TEDxHarvardSquare stage. Exploring AI, biotech, climate, equity, and human potential.",
  },
  sponsorPage: {
    partnersHeading: "Our partners",
    partnersIntro: "With thanks to the partners who make each edition possible.",
    ask: "Interested in partnering with TEDxHarvardSquare?",
    ctaLabel: "Become a sponsor",
    seoDescription:
      "Partner with TEDxHarvardSquare: support an independently organized TEDx event and the community of founders, researchers, creators and leaders around it.",
  },
  aboutPage: {
    title: "About",
    intro:
      "The right idea, heard by the right person, at the right moment, can change the course of a life, a company, or a policy. We exist to create those moments, on stage and in every room we build year-round.",
    body: "TEDxHarvardSquare runs an annual Flagship conference in Cambridge, Massachusetts, and House, our year-round programming between editions. It is independently organized under license from TED.",
    doHeading: "Two ways to be in the room.",
    flagshipTitle: "Flagship",
    flagshipText:
      "Our annual conference. A day of talks by researchers, founders and artists, and the people who come to hear them.",
    flagshipLabel: "Explore Flagship",
    houseTitle: "House",
    houseText:
      "Our year-round programming. Smaller gatherings between editions, so the conversation does not wait for February.",
    houseLabel: "Explore House",
    teamHeading: "The team",
    teamIntro: "Volunteers who organize TEDxHarvardSquare, in Cambridge and beyond.",
    seoDescription:
      "TEDxHarvardSquare is an independently organized TEDx event in Cambridge, Massachusetts: an annual Flagship conference and House, our year-round programming.",
  },
  faqPage: {
    title: "FAQ",
    intro:
      "Ideas worth spreading start with questions worth asking. Whether you're curious about speakers, schedules, or snacks, we've covered the essentials below.",
    contactHeading: "Still have a question?",
    contactBody: "Write to us and a member of the team will get back to you.",
    contactLabel: "Email us",
    seoDescription:
      "Answers to your questions about TEDxHarvardSquare — from tickets and venue logistics to accessibility, food, photography, and how to stay connected after the event.",
  },
  footer: {
    footerHeading: "Stay in the room.",
    footerBody: "First word on Flagship tickets, House events, and new talks.",
    footerSubscribeLabel: "Subscribe",
  },
} as const;

export type PageCopyId = keyof typeof pageCopy;
export type PageCopy<K extends PageCopyId> = { [F in keyof (typeof pageCopy)[K]]: string };
