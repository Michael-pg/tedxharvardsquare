"use client";

/**
 * Sanity Studio, embedded in the site at /studio (src/app/studio).
 */

import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId, studioBasePath } from "./src/sanity/env";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";

/**
 * The sidebar mirrors how the org thinks about its work: the flagship and the
 * year-round programming sit side by side, rather than community events being
 * one more item in a flat list of document types.
 */
const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.listItem()
        .title("Flagship")
        .child(
          S.list()
            .title("Flagship")
            .items([
              S.documentTypeListItem("edition").title("Editions"),
              S.documentTypeListItem("speaker").title("Speakers"),
              S.documentTypeListItem("talk").title("Talks"),
            ]),
        ),
      S.documentTypeListItem("communityEvent").title("Year-round programming"),
      S.divider(),
      S.documentTypeListItem("topic").title("Topics"),
      S.documentTypeListItem("teamMember").title("Team"),
      S.documentTypeListItem("partner").title("Partners"),
    ]);

export default defineConfig({
  name: "tedxharvardsquare",
  title: "TEDxHarvardSquare",
  basePath: studioBasePath,
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons are reached from the sidebar only — never created from "+".
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete")
        : actions,
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
