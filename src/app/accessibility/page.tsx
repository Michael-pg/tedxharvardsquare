import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteSettings } from "@/content";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How TEDxHarvardSquare works to make this website and our events accessible, and how to request an accommodation or report a barrier.",
};

export default async function AccessibilityPage() {
  const site = await getSiteSettings();
  const email = (
    <a href={`mailto:${site.contactEmail}?subject=Accessibility`}>{site.contactEmail}</a>
  );

  return (
    <LegalPage
      title="Accessibility"
      updated="September 25, 2026"
      intro={
        <p>
          Ideas worth spreading should reach everyone. We want our events and this site
          to work for people of all abilities. Where they don&apos;t yet, we want to
          hear about it.
        </p>
      }
    >
      <section>
        <h2>At our events</h2>
        <p>
          Before each event, we share what we know about the venue&apos;s access: step-free
          entry, seating, restrooms, and how to get there. If you need an accommodation,
          such as accessible seating, a companion ticket, a sign language interpreter,
          or information in another format, email {email} when you register. Earlier is
          better, since some requests take time to arrange, but we&apos;ll do what we can
          at any point.
        </p>
      </section>

      <section>
        <h2>On this website</h2>
        <p>
          We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.
          In practice that means:
        </p>
        <ul>
          <li>Everything works with a keyboard, with a visible focus indicator.</li>
          <li>Images have text descriptions.</li>
          <li>Text is designed to meet contrast requirements against its background.</li>
          <li>
            Animation and the 3D artwork respect your device&apos;s reduced-motion setting,
            and all content is readable without them.
          </li>
          <li>The layout adapts to small screens and to zoomed text.</li>
        </ul>
        <p>
          This is ongoing work, and some parts of the site may still fall short.
          Recorded talks are published through YouTube and TED, which provide their own
          captions and players.
        </p>
      </section>

      <section>
        <h2>Report a barrier</h2>
        <p>
          If something on this site or at one of our events doesn&apos;t work for you,
          email {email}. Tell us the page or event and what got in the way. We&apos;ll
          reply within five business days and help you get what you need in the
          meantime.
        </p>
      </section>
    </LegalPage>
  );
}
