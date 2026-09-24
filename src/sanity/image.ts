import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Builds a CDN URL for a Sanity image, e.g. `urlFor(img).width(800).url()`. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
