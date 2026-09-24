import { defineField, defineType } from "sanity";

/**
 * Reusable field shapes. Each mirrors a type in `src/content/types.ts` — keep
 * the two in step, since the content repository maps one onto the other.
 */

export const venue = defineType({
  name: "venue",
  title: "Venue",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "addressLine", title: "Address line", type: "string" }),
    defineField({
      name: "city",
      type: "string",
      initialValue: "Cambridge",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "state",
      type: "string",
      initialValue: "MA",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coordinates",
      type: "object",
      description: "Optional until the venue is confirmed.",
      fields: [
        defineField({ name: "lat", title: "Latitude", type: "number" }),
        defineField({ name: "lng", title: "Longitude", type: "number" }),
      ],
    }),
  ],
});

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https", "mailto"] }),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

/**
 * An image that cannot be saved without alt text. An empty string is allowed
 * only for genuinely decorative images, matching the `Image` type.
 */
export const accessibleImage = defineType({
  name: "accessibleImage",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "Describe the image for screen readers. Leave empty only if the image is purely decorative.",
    }),
  ],
});
