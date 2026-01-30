import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";

import { mountDocsApp } from "../app";
import { docsPages, labPages } from "../src/content";

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

const expectMetadata = (pageTitle: string, summary?: string) => {
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
  const canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  expect(canonical?.href).toBe(
    `${window.location.origin}${window.location.pathname}`,
  );
};

describe("docs seo metadata", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
  });

  it("updates metadata on initial load and route changes", async () => {
    const initialPage = docsPages[0];
    if (!initialPage) throw new Error("No docs pages configured.");

    await waitForContent();
    await nextFrame();

    expectMetadata(
      initialPage.navLabel ?? initialPage.title,
      initialPage.summary,
    );

    const nextLab =
      labPages.find((page) => page.id === "empty-state") ?? labPages[0];
    if (!nextLab) throw new Error("No lab pages configured.");

    window.history.pushState({}, "", `/lab/${nextLab.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitForContent();
    await nextFrame();

    expectMetadata(nextLab.navLabel ?? nextLab.title, nextLab.summary);
  });
});
