"use client";

/**
 * Sanity Studio, embedded in the site at /studio (src/app/studio).
 */

import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId, studioBasePath } from "./src/sanity/env";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";
import { pageTypes } from "./src/sanity/schemaTypes/pages";
import { PanelsTopLeft } from "lucide-react";

/**
 * The sidebar opens with Pages, one document per page with its fields in
 * scroll order, so editors find a heading where they saw it. Then it mirrors
 * how the org thinks about its work: the Flagship and
 * House — the year-round programming — sit side by side, rather than House
 * events being one more item in a flat list of document types.
 */
const singleton = (S: Parameters<StructureResolver>[0], id: string, title: string) =>
  S.listItem().title(title).id(id).schemaType(id).child(S.document().schemaType(id).documentId(id));

const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Each page's headings, intros and buttons, in the order of the menu.
      S.listItem()
        .title("Pages")
        .icon(PanelsTopLeft)
        .child(
          S.list()
            .title("Pages")
            .items(pageTypes.map((type) => singleton(S, type.name, type.title ?? type.name))),
        ),
      singleton(S, "siteSettings", "Site settings"),
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
      S.documentTypeListItem("houseEvent").title("House"),
      S.divider(),
      S.documentTypeListItem("faq").title("FAQ"),
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
