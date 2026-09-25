import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteSettings } from "@/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TEDxHarvardSquare collects, uses, and protects personal information across this website, our newsletter, and our events.",
};

export default async function PrivacyPage() {
  const site = await getSiteSettings();
  const email = (
    <a href={`mailto:${site.contactEmail}?subject=Privacy`}>{site.contactEmail}</a>
  );

  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 25, 2026"
      intro={
        <p>
          {site.name} is an independently organized TEDx event run by volunteers in
          Cambridge, Massachusetts. This policy explains what personal information we
          collect, why, and the choices you have.
        </p>
      }
    >
      <section>
        <h2>What we collect</h2>
        <p>We only collect what we need to run our events and stay in touch:</p>
        <ul>
          <li>
            <strong>Things you send us</strong> — your name, email address, and anything
            else you include when you email us or apply to speak, volunteer, or partner.
          </li>
          <li>
            <strong>Newsletter and early-access sign-ups</strong> — your email address,
            collected by the service that runs that list (see below).
          </li>
          <li>
            <strong>Tickets and registrations</strong> — the details you give our
            ticketing or registration provider when you sign up for an event.
          </li>
          <li>
            <strong>Technical data</strong> — standard request logs (such as IP address,
            browser type, and pages requested) kept by our hosting provider to operate
            and secure the site.
          </li>
        </ul>
        <p>
          We don&apos;t sell personal information, and we don&apos;t use advertising
          trackers on this site.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To run our events, including sending tickets, updates, and venue details.</li>
          <li>To send the newsletter and event announcements you signed up for.</li>
          <li>To reply to your messages and consider applications.</li>
          <li>To keep the site working, secure, and free of abuse.</li>
        </ul>
      </section>

      <section>
        <h2>Services we rely on</h2>
        <p>
          Some information is handled by third-party services, each under its own
          privacy policy: our site host (Vercel), our content system (Sanity), our
          newsletter (Substack), our early-access list (Mailchimp), and whichever
          ticketing platform an event uses. Talk videos are embedded from YouTube in
          privacy-enhanced mode, which doesn&apos;t set YouTube cookies until you press
          play.
        </p>
        <p>
          As a licensed TEDx event, we may share event information (such as speaker
          and talk details) with TED, which publishes TEDx talks.
        </p>
      </section>

      <section>
        <h2>Photography and recording</h2>
        <p>
          Our events are photographed and filmed, and the talks are recorded for
          publication. By attending, you may appear in photos or video we share on
          this site, on social media, and through TED. If you&apos;d rather not be
          featured, tell a team member at the event or email {email} and we&apos;ll do
          our best to accommodate you.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep personal information only as long as we need it for the purposes
          above, then delete it. You can unsubscribe from any email list at any time
          using the link at the bottom of each email.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to show you, correct, or delete the personal information we
          hold about you. Email {email} and we&apos;ll respond within 30 days. Depending
          on where you live, you may have additional rights under local law.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          This site isn&apos;t directed at children under 13, and we don&apos;t knowingly
          collect their personal information.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          If we change this policy, we&apos;ll update the date at the top of this page.
          Questions? Email {email}.
        </p>
      </section>
    </LegalPage>
  );
}
