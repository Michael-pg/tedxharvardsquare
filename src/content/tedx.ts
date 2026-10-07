/**
 * Wording the TEDx licence requires, copied from TED's organizer guide
 * (ted.com/tedx/organizer-guide/design-and-promote-event, "Create your
 * website") and the TEDx rules (ted.com/tedx/before-you-apply/tedx-rules,
 * "Web + Social"). It lives in code, not Studio, on purpose: it must stay word
 * for word. Re-check it against those pages when TED updates them.
 */

/** Every TEDx homepage must link here, visibly. */
export const TEDX_PROGRAM_URL = "https://www.ted.com/tedx";

/** The homepage's "What is TEDx?" text, with our event's name filled in. */
export const whatIsTedx = (name: string) =>
  `In the spirit of discovering and spreading ideas, TED has created a program called TEDx. TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. Our event is called ${name}, where x = independently organized TED event. At our ${name} event, TED Talks video and live speakers will combine to spark deep discussion and connection in a small group. Speakers never pay to join a TEDx event. Consideration, speaker coaching and event participation along with attendance are all provided free of charge. The TED Conference provides general guidance for the TEDx program, but individual TEDx events, including ours, are self-organized.`;

/** "About TEDx", for the About page. */
export const aboutTedx =
  "In the spirit of ideas worth spreading, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, TED Talks video and live speakers combine to spark deep discussion and connection. These local, self-organized events are branded TEDx, where x = independently organized TED event. The TED Conference provides general guidance for the TEDx program, but individual TEDx events are self-organized. (Subject to certain rules and regulations.)";

/** "About TED", for the About page. */
export const aboutTed = [
  "TED is a nonprofit, nonpartisan organization dedicated to discovering, debating and spreading ideas that spark conversation, deepen understanding and drive meaningful change. Our organization is devoted to curiosity, reason, wonder and the pursuit of knowledge — without an agenda. We welcome people from every discipline and culture who seek a deeper understanding of the world and connection with others, and we invite everyone to engage with ideas and activate them in your community.",
  "TED began in 1984 as a conference where Technology, Entertainment and Design converged, but today it spans a multitude of worldwide communities and initiatives exploring everything from science and business to education, arts and global issues. In addition to the TED Talks curated from our annual conferences and published on TED.com, we produce original podcasts, short video series, animated educational lessons (TED-Ed) and TV programs that are translated into more than 100 languages and distributed via partnerships around the world. Each year, thousands of independently run TEDx events bring people together to share ideas and bridge divides in communities on every continent. Through the Audacious Project, TED has helped catalyze more than $3 billion in funding for projects that seek to make the world more beautiful, sustainable and just. In 2020, TED launched Countdown, an initiative to accelerate solutions to the climate crisis and mobilize a movement for a net-zero future, and in 2023 TED launched TED Democracy to spark a new kind of conversation focused on realistic pathways towards a more vibrant and equitable future.",
];

/** Where "About TED" points for TED's programs. */
export const TED_PROGRAMS_URL = "https://www.ted.com/about/programs-initiatives";
