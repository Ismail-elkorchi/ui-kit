/// <reference types="vite/client" />

import type { DocPageContent } from "./content";

const pageModules = import.meta.glob<{ default: DocPageContent }>(
  "./generated/pages/**/*.json",
);

export const loadDocsPageModule = async (
  view: "docs" | "lab",
  id: string,
): Promise<DocPageContent> => {
  const key = `./generated/pages/${view}/${id}.json`;
  const loader = pageModules[key];
  if (!loader) {
    throw new Error(`Docs content not found for ${view}/${id}.`);
  }
  const module = (await loader()) as { default?: DocPageContent };
  return module.default ?? { sections: [] };
};
