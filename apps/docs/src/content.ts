/// <reference types="vite/client" />
import docsManifest from "./generated/docs-manifest.json";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface DocTocItem {
  id: string;
  title: string;
  level: number;
}

export interface DocSection {
  id: string;
  title: string;
  body: string;
}

export interface DocPage {
  id: string;
  title: string;
  summary: string;
  navLabel?: string;
  group?: string;
  kind?: string;
  package?: string;
  type?: string;
  visibility?: "public" | "internal";
  navHidden?: boolean;
  toc: DocTocItem[];
}

export interface DocPageContent {
  sections: DocSection[];
}

interface DocsManifest {
  docsPages: DocPage[];
  labPages: DocPage[];
  componentPageIds?: string[];
}

const content = docsManifest as DocsManifest;

const pageModules = import.meta.glob<{ default: DocPageContent }>(
  "./generated/pages/**/*.json",
);

export const docsPages = content.docsPages;
export const labPages = content.labPages;
export const componentPageIds = content.componentPageIds ?? [];
export const isPublicPage = (page: DocPage) =>
  (page.visibility ?? "public") !== "internal";
export const publicDocsPages = docsPages.filter(isPublicPage);
export const publicLabPages = labPages.filter(isPublicPage);
export const isNavVisiblePage = (page: DocPage) => !page.navHidden;
export const publicDocsNavPages = publicDocsPages.filter(isNavVisiblePage);

let componentPages: DocPage[] = [];
let componentPagesPromise: Promise<DocPage[]> | null = null;

const resolveComponentPagesPayload = (payload: unknown): DocPage[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as DocPage[];
  if (
    typeof payload === "object" &&
    Array.isArray((payload as { componentPages?: DocPage[] }).componentPages)
  ) {
    return (payload as { componentPages?: DocPage[] }).componentPages ?? [];
  }
  return [];
};

export const ensureComponentPages = async () => {
  if (componentPagesPromise) return componentPagesPromise;
  componentPagesPromise = import("./generated/docs-components.json").then(
    (module) => {
      const payload = (module as { default?: unknown }).default ?? module;
      componentPages = resolveComponentPagesPayload(payload);
      return componentPages;
    },
  );
  return componentPagesPromise;
};

export const getAllDocsPages = () => [...docsPages, ...componentPages];
export const getPublicDocsPages = () => getAllDocsPages().filter(isPublicPage);

export const buildPageMap = () => {
  const map = new Map<string, DocPage>();
  for (const page of docsPages) {
    map.set(`docs/${page.id}`, page);
  }
  for (const page of componentPages) {
    map.set(`docs/${page.id}`, page);
  }
  for (const page of labPages) {
    map.set(`lab/${page.id}`, page);
  }
  return map;
};

export const loadPageContent = async (
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

export const renderToc = (page: DocPage) => {
  if (page.toc.length === 0) return "";
  return `<nav aria-label="On this page" class="docs-toc"><ul class="docs-toc-list">${page.toc
    .map(
      (item) =>
        `<li class="docs-toc-item" data-level="${String(item.level)}"><uik-text as="p" class="docs-paragraph"><uik-link href="#${item.id}">${escapeHtml(
          item.title,
        )}</uik-link></uik-text></li>`,
    )
    .join("")}</ul></nav>`;
};

export const renderPageSections = (page: DocPageContent) => {
  return page.sections
    .map((sectionItem) => {
      return `
        <section class="docs-section" id="${sectionItem.id}">
          <uik-section-card class="docs-section-card">
            <uik-heading slot="title" level="2" class="docs-heading docs-section-heading">
              <a class="docs-heading-anchor" href="#${sectionItem.id}" aria-label="Link to ${escapeHtml(
                sectionItem.title,
              )}">#</a>
              <span class="docs-heading-text">${escapeHtml(
                sectionItem.title,
              )}</span>
            </uik-heading>
            <div class="docs-section-body">${sectionItem.body}</div>
          </uik-section-card>
        </section>
      `;
    })
    .join("");
};
