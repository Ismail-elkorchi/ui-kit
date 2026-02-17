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

describe("components docs", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("lists primitives, patterns, and shell components on the index", async () => {
    window.history.replaceState({}, "", "/docs/components");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const primitives = document.querySelector(
      '[data-component-package="ui-primitives"][data-component-tag="uik-alert"]',
    );
    const patterns = document.querySelector(
      '[data-component-package="ui-patterns"][data-component-tag="uik-empty-state"]',
    );
    const shell = document.querySelector(
      '[data-component-package="ui-shell"][data-component-tag="uik-shell-layout"]',
    );

    expect(primitives).toBeTruthy();
    expect(patterns).toBeTruthy();
    expect(shell).toBeTruthy();
  });

  it("renders component API sections and valid import snippets", async () => {
    window.history.replaceState({}, "", "/docs/components/uik-alert");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const apiSection = document.querySelector<HTMLElement>(
      '[data-component-api="uik-alert"]',
    );
    expect(apiSection).toBeTruthy();

    const labels = Array.from(apiSection?.querySelectorAll("dt") ?? []).map(
      (el) => el.textContent,
    );
    expect(labels).toContain("Slots");
    expect(labels).toContain("Parts");

    const codeBlock = document.querySelector<HTMLElement>(".docs-code-content");
    expect(codeBlock?.textContent).toContain(
      "@ismail-elkorchi/ui-primitives/register",
    );
  });
});
