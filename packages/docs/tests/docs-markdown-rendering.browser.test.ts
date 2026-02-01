import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";

import "../src/docs.css";
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
    if (!table) throw new Error("Docs table not found.");
    const tableWrap = table.closest(".docs-table-wrap");
    expect(tableWrap).toBeTruthy();
    expect(table.querySelector("thead")).toBeTruthy();
    expect(table.querySelector("tbody")).toBeTruthy();
    const headers = Array.from(table.querySelectorAll("thead th")).map(
      (header) => header.textContent.trim(),
    );
    expect(headers).toContain("Surface");
    expect(headers).toContain("Status");

    const infoAlert = content.querySelector('uik-alert[variant="info"]');
    expect(infoAlert).toBeTruthy();
    const infoTitle = infoAlert?.querySelector('[slot="title"]');
    expect(infoTitle?.textContent.trim()).toBe("Note");
    const infoParagraphs = infoAlert?.querySelectorAll("uik-text") ?? [];
    expect(infoParagraphs.length).toBeGreaterThan(1);
    expect(infoAlert?.querySelector("ul")).toBeTruthy();
    const inlineCodes = Array.from(
      infoAlert?.querySelectorAll("code") ?? [],
    ).map((code) => code.textContent.trim());
    expect(inlineCodes).toContain("inline code");

    const warningAlert = content.querySelector('uik-alert[variant="warning"]');
    expect(warningAlert).toBeTruthy();
    const warningTitle = warningAlert?.querySelector('[slot="title"]');
    expect(warningTitle?.textContent.trim()).toBe("Warning");

    const blockquote = content.querySelector("blockquote.docs-blockquote");
    expect(blockquote).toBeTruthy();
    expect(blockquote?.closest("uik-alert")).toBeNull();
  });

  it("renders highlighted code blocks and preserves inline code", async () => {
    window.history.replaceState({}, "", "/lab/markdown-rendering");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
    await waitForContent();

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");

    const codeBlocks = Array.from(
      content.querySelectorAll<HTMLElement>(".docs-code-block"),
    );
    expect(codeBlocks.length).toBeGreaterThanOrEqual(4);

    const codeTokens = content.querySelectorAll(".docs-code-token");
    expect(codeTokens.length).toBeGreaterThan(0);

    const codeContents = Array.from(
      content.querySelectorAll<HTMLElement>(".docs-code-content"),
    );
    const codeLanguages = codeContents
      .map((node) => node.dataset.language)
      .filter(Boolean);
    expect(codeLanguages.length).toBeGreaterThan(0);

    const inlineCodes = Array.from(content.querySelectorAll("code")).filter(
      (node) => !node.closest(".docs-code-block"),
    );
    expect(inlineCodes.length).toBeGreaterThan(0);
    inlineCodes.forEach((node) => {
      expect(node.closest(".docs-code")).toBeNull();
      expect(node.querySelector(".docs-code-token")).toBeNull();
    });

    const hasForcedColorsRule = Array.from(document.styleSheets).some(
      (sheet) => {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          return false;
        }
        return Array.from(rules).some((rule) => {
          if (rule.type !== CSSRule.MEDIA_RULE) return false;
          const mediaRule = rule;
          if (!mediaRule.conditionText.includes("forced-colors")) return false;
          return Array.from(mediaRule.cssRules).some((innerRule) =>
            innerRule.cssText.includes(".docs-code"),
          );
        });
      },
    );
    expect(hasForcedColorsRule).toBe(true);
  });
});
