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

describe("docs markdown rendering", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders tables and admonitions", async () => {
    window.history.replaceState({}, "", "/lab/markdown-rendering");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
    await waitForContent();

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");

    const table = content.querySelector("table");
    expect(table).toBeTruthy();
    const tableWrap = table?.closest(".docs-table-wrap");
    expect(tableWrap).toBeTruthy();
    expect(table?.querySelector("thead")).toBeTruthy();
    expect(table?.querySelector("tbody")).toBeTruthy();
    const headers = Array.from(table?.querySelectorAll("thead th") ?? []).map(
      (header) => header.textContent?.trim(),
    );
    expect(headers).toContain("Surface");
    expect(headers).toContain("Status");

    const infoAlert = content.querySelector('uik-alert[variant="info"]');
    expect(infoAlert).toBeTruthy();
    const infoTitle = infoAlert?.querySelector('[slot="title"]');
    expect(infoTitle?.textContent?.trim()).toBe("Note");
    const infoParagraphs = infoAlert?.querySelectorAll("uik-text") ?? [];
    expect(infoParagraphs.length).toBeGreaterThan(1);
    expect(infoAlert?.querySelector("ul")).toBeTruthy();
    const inlineCodes = Array.from(
      infoAlert?.querySelectorAll("code") ?? [],
    ).map((code) => code.textContent?.trim());
    expect(inlineCodes).toContain("inline code");

    const warningAlert = content.querySelector('uik-alert[variant="warning"]');
    expect(warningAlert).toBeTruthy();
    const warningTitle = warningAlert?.querySelector('[slot="title"]');
    expect(warningTitle?.textContent?.trim()).toBe("Warning");

    const blockquote = content.querySelector("blockquote.docs-blockquote");
    expect(blockquote).toBeTruthy();
    expect(blockquote?.closest("uik-alert")).toBeNull();
  });
});
