import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";

import { mountDocsApp } from "../app";

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

type PageSpec = {
  route: string;
  title: string;
  summary: string;
  specifiers: string[];
};

const pages: PageSpec[] = [
  {
    route: "/docs/integrations/electron",
    title: "Electron",
    summary:
      "Integrate UIK with Electron using standards-first ESM, token layers, and secure renderer boundaries.",
    specifiers: [
      "@ismail-elkorchi/ui-tokens/base.css",
      "@ismail-elkorchi/ui-shell/register",
    ],
  },
  {
    route: "/docs/integrations/webviews",
    title: "Webviews",
    summary:
      "Ship UIK inside embedded webviews with strict CSP, predictable module loading, and token-first styling.",
    specifiers: [
      "@ismail-elkorchi/ui-tokens/base.css",
      "@ismail-elkorchi/ui-primitives/register",
    ],
  },
  {
    route: "/docs/integrations/mobile-web",
    title: "Mobile web",
    summary:
      "Deliver UIK on mobile web with lean bundles, tokens-first setup, and performance-aware defaults.",
    specifiers: [
      "@ismail-elkorchi/ui-tokens/base.css",
      "@ismail-elkorchi/ui-patterns/register",
    ],
  },
];

describe("docs integrations", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders integration guides with metadata and copyable snippets", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");

    window.history.replaceState({}, "", pages[0].route);
    await mountDocsApp(root);

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      if (index > 0) {
        window.history.pushState({}, "", page.route);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
      await waitForContent();
      await nextFrame();

      expect(document.title).toBe(`UI Kit — ${page.title}`);
      expect(getMetaContent('meta[name="description"]')).toBe(page.summary);
      expect(getMetaContent('meta[name="robots"]')).toBe("index,follow");

      const content = document.querySelector<HTMLElement>(
        "[data-docs-content]",
      );
      if (!content) throw new Error("Docs content root not found.");

      const codeBlock = content.querySelector("uik-code-block[copyable]");
      expect(codeBlock).toBeTruthy();

      const codeText = Array.from(content.querySelectorAll("uik-code-block"))
        .map((block) => block.textContent ?? "")
        .join("\n");

      page.specifiers.forEach((specifier) => {
        expect(codeText).toContain(specifier);
      });
    }
  });
});
