/**
 * Copy for the Flagship page, written by the organizers for Edition 3
 * ("Against Entropy", 2027). It is the starting draft and more is coming, so
 * it lives here in code for now; once it settles it should move to fields on
 * the edition in Sanity, and this module goes away. The facts (theme, year,
 * venue, date, ticket link) already come from the edition in Studio.
 */
export const flagshipCopy = {
  /** Shown while the edition's exact date is empty in Studio. */
  when: "February 2027",
  place: "Cambridge, Massachusetts",
  hook: ["Everything tends toward disorder.", "Unless we choose otherwise."],
  /** The theme statement, lit line by line as it scrolls past. */
  statement: ["It’s easy to let things happen.", "It’s harder to stop,", "see what isn’t working,", "and choose to build."],
  invitation:
    "This February, TEDxHarvardSquare brings together scientists, entrepreneurs, artists, researchers, leaders, and curious minds for a day of ideas, conversations, and new perspectives.",
  questions: ["What do we want to preserve?", "What do we want to change?", "What can we build together?"],
  program: {
    title: "Meet what’s next",
    body: [
      "Talks, Discovery Sessions, and conversations with people who have ideas to share, questions to ask, and new things to build.",
      "Come to listen. Meet someone who might help you see things differently.",
    ],
  },
  close: {
    title: "Now what?",
    body: [
      "You might arrive for one idea and leave with a new question, a new perspective, or a person to build something with.",
      "You don’t know what will happen next. And that’s the point.",
    ],
  },
};
