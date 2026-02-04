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

const page = {
  route: "/docs/policies/edge-adapters",
  title: "Edge adapters",
  summary:
    "Policy for framework adapters and integration boundaries in UI Kit.",
  specifiers: [
    "@ismail-elkorchi/ui-tokens/base.css",
    "@ismail-elkorchi/ui-primitives/register",
  ],
};

describe("docs edge adapters policy", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders policy page with metadata and copyable snippet", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");

    window.history.replaceState({}, "", page.route);
    await mountDocsApp(root);

    await waitForContent();
    await nextFrame();

    expect(document.title).toBe(`UI Kit — ${page.title}`);
    expect(getMetaContent('meta[name="description"]')).toBe(page.summary);
    expect(getMetaContent('meta[name="robots"]')).toBe("index,follow");

    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    expect(canonical?.href).toBe(
      `${window.location.origin}${window.location.pathname}`,
    );

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");

    const codeBlock = content.querySelector("uik-code-block[copyable]");
    expect(codeBlock).toBeTruthy();

    const codeText = Array.from(content.querySelectorAll("uik-code-block"))
      .map((block) => block.textContent ?? "")
      .join("\n");

    page.specifiers.forEach((specifier) => {
      expect(codeText).toContain(specifier);
    });
  });
});
