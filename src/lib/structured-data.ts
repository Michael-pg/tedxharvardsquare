import type { Edition, Image, SiteConfig, SpeakerWithTalk } from "@/content";

/**
 * schema.org descriptions of the org and its editions, for search results.
 * Built from content only: a field the Studio leaves empty is left out rather
 * than guessed, and an edition without a date gets no Event at all, since
 * Google discards events that lack one.
 */

const organizationId = (site: SiteConfig) => `${site.url}/#organization`;

/** The org and the site, for the home page. */
export function organizationJsonLd(site: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId(site),
        name: site.name,
        url: site.url,
        description: site.description,
        logo: `${site.url}/brand/tedx-harvard-square-black.png`,
        email: site.contactEmail,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Cambridge",
          addressRegion: "MA",
          addressCountry: "US",
        },
        sameAs: site.social.map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        inLanguage: site.locale,
        publisher: { "@id": organizationId(site) },
      },
    ],
  };
}

/** A Flagship edition as an Event, or nothing until its date is set. */
export function editionJsonLd(site: SiteConfig, edition: Edition, image?: Image) {
  if (!edition.date) return undefined;
  const venue = edition.venue;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: edition.theme ? `${site.name} ${edition.year}: ${edition.theme}` : `${site.name} ${edition.year}`,
    description: edition.themeStatement ?? site.description,
    startDate: edition.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${site.url}/flagship`,
    ...(image?.src && { image: [image.src] }),
    ...(venue && {
      location: {
        "@type": "Place",
        name: venue.name,
        address: {
          "@type": "PostalAddress",
          ...(venue.addressLine && { streetAddress: venue.addressLine }),
          addressLocality: venue.city,
          addressRegion: venue.state,
          addressCountry: "US",
        },
      },
    }),
    ...(edition.ticketUrl && { offers: { "@type": "Offer", url: edition.ticketUrl } }),
    organizer: { "@type": "Organization", "@id": organizationId(site), name: site.name, url: site.url },
  };
}

/**
 * A speaker's page as a ProfilePage about them. Their talk video is left to
 * Google's own detection of the YouTube embed: a VideoObject needs an upload
 * date, which the Studio does not hold.
 */
export function speakerJsonLd(site: SiteConfig, speaker: SpeakerWithTalk) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${site.url}/speakers/${speaker.slug}`,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "Person",
      name: speaker.name,
      ...(speaker.title && { jobTitle: speaker.title }),
      ...(speaker.bio && { description: speaker.bio }),
      ...(speaker.headshot?.src && { image: speaker.headshot.src }),
      ...(speaker.links.length > 0 && { sameAs: speaker.links.map((link) => link.href) }),
    },
  };
}
