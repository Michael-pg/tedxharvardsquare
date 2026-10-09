"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";

/** GA4 property run by the marketing team. Measurement IDs are public. */
const GA_ID = "G-MP9EG22C1W";

const noop = () => () => {};

/**
 * Google Analytics, on the live domain only.
 *
 * Localhost, PR previews and the `*.vercel.app` alias serve the same pages, so
 * the host is checked in the browser rather than at build time; a server check
 * would need request headers and make every page dynamic. The Studio is left
 * out so editors working in the CMS don't count as visitors.
 */
export function Analytics({ siteUrl }: { siteUrl: string }) {
  const host = useSyncExternalStore(
    noop,
    () => window.location.hostname,
    () => null,
  );
  const pathname = usePathname();

  if (host !== new URL(siteUrl).hostname) return null;
  if (pathname.startsWith("/studio")) return null;
  return <GoogleAnalytics gaId={GA_ID} />;
}
