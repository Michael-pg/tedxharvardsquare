import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/content";

/**
 * Every public page. There are no per-item pages yet; when speaker or House
 * event pages arrive, list them here from `@/content`.
 */
const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/flagship", priority: 0.9, changeFrequency: "weekly" },
  { path: "/house", priority: 0.9, changeFrequency: "weekly" },
  { path: "/speakers", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sponsor", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/code-of-conduct", priority: 0.3, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSettings();
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${site.url}${path}`,
    priority,
    changeFrequency,
  }));
}
