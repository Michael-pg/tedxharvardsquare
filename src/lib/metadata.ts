import "server-only";
import type { Metadata } from "next";
import { getSiteSettings } from "@/content";

/** Open Graph wants `en_US`; Studio stores the BCP 47 form, `en-US`. */
export const ogLocale = (locale: string) => locale.replace("-", "_");

/**
 * Metadata for a page below the home page. A page that sets `openGraph`
 * replaces the root layout's object outright rather than merging with it, so
 * this rebuilds the whole thing: without it every page would share the home
 * page's share title and URL. The share image comes from the nearest
 * `opengraph-image.tsx`.
 */
export async function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** The page's own path, e.g. `/speakers`: its canonical URL against `metadataBase`. */
  path: string;
}): Promise<Metadata> {
  const site = await getSiteSettings();
  const shareTitle = `${title} — ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: ogLocale(site.locale),
      url: path,
      siteName: site.name,
      title: shareTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description },
  };
}
