/** Pulls the video ID out of a canonical `youtube.com/watch?v=` or `youtu.be` URL. */
export function youTubeId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null;
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}
