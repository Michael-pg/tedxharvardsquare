import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteSettings } from "@/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply when you use the TEDxHarvardSquare website or attend one of our events.",
};

export default async function TermsPage() {
  const site = await getSiteSettings();
  const email = (
    <a href={`mailto:${site.contactEmail}?subject=Terms`}>{site.contactEmail}</a>
  );

  return (
    <LegalPage
      title="Terms of Use"
      updated="September 25, 2026"
      intro={
        <p>
          These terms apply when you use this website or attend a {site.name} event.
          By doing either, you agree to them. Our{" "}
          <Link
            href="/privacy"
            className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-brand"
          >
            Privacy Policy
          </Link>{" "}
          explains how we handle personal information.
        </p>
      }
    >
      <section>
        <h2>Who we are</h2>
        <p>
          {site.name} is an independently organized TEDx event, operated under license
          from TED. TED, TEDx, and related marks are trademarks of TED Conferences, LLC
          and are used under that license. TED does not operate this site or our events.
        </p>
      </section>

      <section>
        <h2>Using this site</h2>
        <p>
          You&apos;re welcome to browse, read, and share links to anything here. Please
          don&apos;t misuse the site — for example by trying to disrupt it, access it in
          ways it wasn&apos;t built for, or scrape it in bulk.
        </p>
      </section>

      <section>
        <h2>Content and trademarks</h2>
        <p>
          Text, photography, and design on this site belong to {site.name} or the people
          who created them, and are used with permission. Talk videos are published by
          TED and are subject to TED&apos;s own terms. Please don&apos;t reuse our
          content, logos, or the TEDx name without written permission — email {email} to
          ask.
        </p>
      </section>

      <section>
        <h2>Events and tickets</h2>
        <ul>
          <li>
            Tickets are sold through third-party platforms, whose terms and refund
            policies apply alongside ours.
          </li>
          <li>
            Speakers, schedules, and venues can change. We&apos;ll share changes as early
            as we can.
          </li>
          <li>
            We expect everyone at our events to treat each other with respect. We may
            ask anyone who doesn&apos;t to leave, without a refund.
          </li>
          <li>
            Events are photographed and recorded. See the Privacy Policy for how that
            footage is used and how to opt out.
          </li>
        </ul>
      </section>

      <section>
        <h2>Links to other sites</h2>
        <p>
          We link to sites we don&apos;t run, such as ticketing, newsletter, and social
          platforms. We&apos;re not responsible for their content or practices.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          We work to keep this site accurate and available, but it&apos;s provided
          &ldquo;as is&rdquo;, without warranties of any kind. To the extent the law
          allows, {site.name} and its volunteers aren&apos;t liable for losses arising
          from your use of the site. Views expressed by speakers are their own.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms; the date at the top of this page shows when they
          last changed. These terms are governed by the laws of the Commonwealth of
          Massachusetts. Questions? Email {email}.
        </p>
      </section>
    </LegalPage>
  );
}
