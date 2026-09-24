/**
 * Sanity connection settings, shared by the Studio and the site.
 *
 * The project ID and dataset are public identifiers — they appear in every
 * browser request the Studio makes — so they are committed as defaults rather
 * than required env vars. That keeps Vercel preview deploys working without
 * per-environment setup. Env vars still win, for pointing a branch at a
 * different dataset.
 */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "k0dqlqmb";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/** Pinned so a Sanity API change can never alter query results silently. */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-09-01";

/** Where the embedded Studio is mounted — must match the app route folder. */
export const studioBasePath = "/studio";
