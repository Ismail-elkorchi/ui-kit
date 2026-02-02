import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";

import { mountDocsApp } from "../app";
import { labPages, publicDocsPages, publicLabPages } from "../src/content";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForContent = async (attempts = 60) => {
  for (let i = 0; i < attempts; i += 1) {
    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    const isReady =
      content?.getAttribute("aria-busy") === "false" &&
      content.innerHTML.trim();
    if (isReady) return;
    await nextFrame();
  }
  throw new Error("Docs content did not render.");
};

const getMetaContent = (selector: string) => {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  return element?.content ?? "";
};

const buildDescription = (pageTitle: string, summary?: string) => {
  const normalized = summary?.trim();
  if (normalized && normalized.length > 0) return normalized;
  return `UI Kit documentation — ${pageTitle}`;
};

const expectMetadata = (
  pageTitle: string,
  summary?: string,
  robotsContent = "index,follow",
) => {
  const description = buildDescription(pageTitle, summary);
  const expectedTitle = `UI Kit — ${pageTitle}`;
  expect(document.title).toBe(expectedTitle);
  expect(getMetaContent('meta[name="description"]')).toBe(description);
  expect(getMetaContent('meta[property="og:title"]')).toBe(expectedTitle);
  expect(getMetaContent('meta[property="og:description"]')).toBe(description);
  expect(getMetaContent('meta[property="og:url"]')).toBe(
    `${window.location.origin}${window.location.pathname}`,
  );
  expect(getMetaContent('meta[name="twitter:title"]')).toBe(expectedTitle);
  expect(getMetaContent('meta[name="twitter:description"]')).toBe(description);
  expect(getMetaContent('meta[name="robots"]')).toBe(robotsContent);
  const canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  expect(canonical?.href).toBe(
    `${window.location.origin}${window.location.pathname}`,
  );
};

describe("docs seo metadata", () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
  });

  it("updates metadata on initial load and route changes", async () => {
    const initialPage = publicDocsPages[0];
    if (!initialPage) throw new Error("No docs pages configured.");

    await waitForContent();
    await nextFrame();

    expectMetadata(
      initialPage.navLabel ?? initialPage.title,
      initialPage.summary,
      "index,follow",
    );

    const nextLab =
      publicLabPages.find((page) => page.id === "empty-state") ??
      publicLabPages[0];
    if (!nextLab) throw new Error("No examples pages configured.");

    window.history.pushState({}, "", `/lab/${nextLab.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitForContent();
    await nextFrame();

    expectMetadata(
      nextLab.navLabel ?? nextLab.title,
      nextLab.summary,
      "index,follow",
    );
  });

  it("renders metadata for internal routes", async () => {
    const internalPage = labPages.find(
      (page) => page.visibility === "internal",
    );
    if (!internalPage) {
      throw new Error("No internal pages configured.");
    }

    window.history.pushState({}, "", `/lab/${internalPage.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitForContent();
    await nextFrame();

    expectMetadata(
      internalPage.navLabel ?? internalPage.title,
      internalPage.summary,
      "noindex,nofollow",
    );
  });
});
