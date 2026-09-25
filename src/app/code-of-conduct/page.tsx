import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteSettings } from "@/content";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "The standard of behavior we expect from everyone at TEDxHarvardSquare events — attendees, speakers, partners, volunteers, and organizers — and how to report a problem.",
};

export default async function CodeOfConductPage() {
  const site = await getSiteSettings();
  const email = (
    <a href={`mailto:${site.contactEmail}?subject=Code%20of%20Conduct`}>
      {site.contactEmail}
    </a>
  );

  return (
    <LegalPage
      title="Code of Conduct"
      updated="September 25, 2026"
      intro={
        <p>
          Good ideas need a room where people feel safe enough to say them and open
          enough to hear them. This code applies to everyone at {site.name} — attendees,
          speakers, performers, partners, volunteers, and organizers.
        </p>
      }
    >
      <section>
        <h2>Where it applies</h2>
        <p>
          At our Flagship conference and every House event, at venues we use and
          gatherings connected to them, and in the online spaces we run, including our
          social channels and newsletter comments.
        </p>
      </section>

      <section>
        <h2>What we expect</h2>
        <ul>
          <li>Treat everyone with respect, including people you disagree with.</li>
          <li>Challenge ideas, not people. Debate is welcome; personal attacks are not.</li>
          <li>Listen as much as you talk, and make room for others to take part.</li>
          <li>Respect people&apos;s boundaries, including their time and personal space.</li>
          <li>Follow the instructions of event staff and the venue&apos;s rules.</li>
        </ul>
      </section>

      <section>
        <h2>What isn&apos;t acceptable</h2>
        <p>Harassment in any form, including:</p>
        <ul>
          <li>
            Offensive or demeaning comments about someone&apos;s race, ethnicity, national
            origin, religion, gender, gender identity or expression, sexual orientation,
            disability, age, appearance, or background.
          </li>
          <li>Unwelcome sexual attention, touching, or advances.</li>
          <li>Intimidation, threats, stalking, or following someone.</li>
          <li>Photographing or recording someone who has asked you not to.</li>
          <li>Repeatedly disrupting talks, conversations, or events.</li>
          <li>Pitching or soliciting people who have made clear they aren&apos;t interested.</li>
        </ul>
        <p>
          Speakers present their own views, and challenging ideas are part of the point.
          But talks, slides, and performances are covered by this code too.
        </p>
      </section>

      <section>
        <h2>Reporting a problem</h2>
        <p>
          If something happens that makes you or someone else feel unsafe or
          unwelcome, tell any organizer or volunteer at the event, or email {email}{" "}
          at any time, including after the event. You don&apos;t need to be certain a
          rule was broken to talk to us.
        </p>
        <p>
          We&apos;ll take every report seriously, keep it as confidential as we can, and
          won&apos;t share your identity without your permission. If you&apos;re in
          immediate danger, call 911 first.
        </p>
      </section>

      <section>
        <h2>What happens next</h2>
        <p>
          Organizers will decide how to respond. That can range from a warning to
          removal from the event without a refund, and being barred from future
          events. Retaliating against someone for making a report is itself a
          violation of this code.
        </p>
      </section>
    </LegalPage>
  );
}
