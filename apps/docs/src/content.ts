/// <reference types="vite/client" />

import { loadDocsPageModule } from "./content-page-modules";

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

let docsManifest: DocsManifest | null = null;
let docsManifestPromise: Promise<DocsManifest> | null = null;

export let docsPages: DocPage[] = [];
export let labPages: DocPage[] = [];
export let componentPageIds: string[] = [];
export const isPublicPage = (page: DocPage) =>
  (page.visibility ?? "public") !== "internal";
export let publicDocsPages: DocPage[] = [];
export let publicLabPages: DocPage[] = [];
export const isNavVisiblePage = (page: DocPage) => !page.navHidden;
export let publicDocsNavPages: DocPage[] = [];

const assignManifest = (manifest: DocsManifest) => {
  docsManifest = manifest;
  docsPages = manifest.docsPages;
  labPages = manifest.labPages;
  componentPageIds = manifest.componentPageIds ?? [];
  publicDocsPages = docsPages.filter(isPublicPage);
  publicLabPages = labPages.filter(isPublicPage);
  publicDocsNavPages = publicDocsPages.filter(isNavVisiblePage);
};

export const ensureDocsContent = async () => {
  if (docsManifest) return docsManifest;
  if (!docsManifestPromise) {
    docsManifestPromise = import("./generated/docs-manifest.json").then(
      (module) => {
        const manifest =
          (module as { default?: DocsManifest }).default ??
          (module as DocsManifest);
        assignManifest(manifest);
        return manifest;
      },
    );
  }
  return docsManifestPromise;
};

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
): Promise<DocPageContent> => loadDocsPageModule(view, id);

export const renderToc = (page: DocPage) => {
  if (page.toc.length === 0) return "";
  return `<nav aria-label="On this page" class="docs-toc"><ul class="docs-toc-list">${page.toc
    .map(
      (item) =>
        `<li class="docs-toc-item" data-level="${String(item.level)}"><p class="docs-paragraph"><a class="docs-toc-link" href="#${item.id}">${escapeHtml(
          item.title,
        )}</a></p></li>`,
    )
    .join("")}</ul></nav>`;
};

export const renderPageSections = (page: DocPageContent) => {
  return page.sections.map(renderPageSection).join("");
};

export const renderPageSection = (sectionItem: DocSection) => {
  const sectionBody = sectionItem.body
    .replace(
      /<uik-text([^>]*class="[^"]*docs-paragraph[^"]*"[^>]*)>([\s\S]*?)<\/uik-text>/gi,
      "<p$1>$2</p>",
    )
    .replace(
      /<uik-heading([^>]*class="[^"]*docs-heading[^"]*"[^>]*)>([\s\S]*?)<\/uik-heading>/gi,
      (_match, attrs: string, inner: string) => {
        const levelMatch = attrs.match(/\blevel="([1-6])"/i);
        const level = levelMatch?.[1] ?? "2";
        const normalizedAttrs = attrs.replace(/\slevel="[^"]*"/i, "");
        return `<h${level}${normalizedAttrs}>${inner}</h${level}>`;
      },
    );
  return `
    <section class="docs-section" id="${sectionItem.id}">
      <section class="docs-section-surface">
        <div class="docs-section-inner">
          <h2 class="docs-heading docs-section-heading">
          <a class="docs-heading-anchor" href="#${sectionItem.id}" aria-label="Link to ${escapeHtml(
            sectionItem.title,
          )}">#</a>
          <span class="docs-heading-text">${escapeHtml(sectionItem.title)}</span>
          </h2>
          <div class="docs-section-body">${sectionBody}</div>
        </div>
      </section>
    </section>
  `;
};
