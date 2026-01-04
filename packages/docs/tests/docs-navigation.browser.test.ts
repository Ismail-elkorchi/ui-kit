import type { UikNav } from "@ismail-elkorchi/ui-primitives";
import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mountDocsApp } from "../app";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForContent = async (attempts = 10) => {
  for (let i = 0; i < attempts; i += 1) {
    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (content?.innerHTML.trim()) return;
    await nextFrame();
  }
  throw new Error("Docs content did not render.");
};

describe("docs navigation", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
  });

  it("navigates to the tokens page via keyboard", async () => {
    await customElements.whenDefined("uik-nav");
    const nav = document.querySelector<UikNav>("uik-nav");
    await nav?.updateComplete;
    await waitForContent();

    const link = nav?.shadowRoot?.querySelector<HTMLAnchorElement>(
      'a[href="/docs/tokens"]',
    );
    expect(link).toBeTruthy();

    link?.focus();
    await userEvent.keyboard("{Enter}");
    await nextFrame();
    await waitForContent();

    const title = document.querySelector("[data-docs-title]");
    expect(title?.textContent).toContain("Tokens");
  });
});
