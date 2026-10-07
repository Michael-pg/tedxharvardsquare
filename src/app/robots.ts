import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/content";

/**
 * Everything but the Studio is open to crawlers. The `*.vercel.app` hosts are
 * kept out of the index by an `X-Robots-Tag` header (next.config.ts), not
 * here: a disallow would stop crawlers from ever seeing that header.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteSettings();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/studio" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
