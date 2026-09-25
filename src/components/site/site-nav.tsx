import { getMenuImages, getSiteSettings } from "@/content";
import { Nav } from "./nav";

/** Server boundary for the nav: fetches what the client component needs. */
export async function SiteNav() {
  const [site, menuImages] = await Promise.all([getSiteSettings(), getMenuImages()]);
  return <Nav contactEmail={site.contactEmail} menuImages={menuImages} />;
}
