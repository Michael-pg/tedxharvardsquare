/**
 * Structured data for search engines, rendered as the Next docs recommend: a
 * plain script tag, with `<` escaped so no content value can close it early.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
