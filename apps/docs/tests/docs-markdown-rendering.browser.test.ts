import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    await mountDocsApp(root);
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
    const infoParagraphs =
      infoAlert?.querySelectorAll(".docs-paragraph") ?? [];
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
    await mountDocsApp(root);
    await waitForContent();

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");

    const codeBlocks = Array.from(
      content.querySelectorAll<HTMLElement>("uik-code-block"),
    );
    expect(codeBlocks.length).toBeGreaterThanOrEqual(4);

    const codeTokens = content.querySelectorAll(".docs-code-token");
    expect(codeTokens.length).toBeGreaterThan(0);

    const [firstBlock] = codeBlocks;
    if (!firstBlock) throw new Error("Expected at least one code block.");
    const copyButton =
      firstBlock.shadowRoot?.querySelector<HTMLButtonElement>("button.copy");
    expect(copyButton).toBeTruthy();
    const wrapper =
      firstBlock.shadowRoot?.querySelector<HTMLElement>(".wrapper");
    if (!wrapper) throw new Error("Code block wrapper not found.");
    const tokenBorderWidth = getComputedStyle(firstBlock)
      .getPropertyValue("--uik-component-code-block-border-width")
      .trim();
    expect(tokenBorderWidth).not.toBe("");
    const probe = document.createElement("div");
    probe.style.borderTopWidth = tokenBorderWidth;
    probe.style.borderTopStyle = "solid";
    document.body.appendChild(probe);
    const resolvedBorderWidth = getComputedStyle(probe).borderTopWidth;
    probe.remove();
    expect(getComputedStyle(wrapper).borderTopWidth).toBe(resolvedBorderWidth);

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      copyButton?.click();
      await (firstBlock as unknown as { updateComplete: Promise<void> })
        .updateComplete;
      expect(writeText).toHaveBeenCalled();
    } finally {
      if (originalClipboard) {
        Object.defineProperty(navigator, "clipboard", {
          value: originalClipboard,
          configurable: true,
        });
      } else {
        delete (navigator as typeof navigator & { clipboard?: Clipboard })
          .clipboard;
      }
    }

    const codeContents = Array.from(
      content.querySelectorAll<HTMLElement>(".docs-code-content"),
    );
    const codeLanguages = codeContents
      .map((node) => node.dataset.language)
      .filter(Boolean);
    expect(codeLanguages.length).toBeGreaterThan(0);

    const escapedBlock = codeContents.find((node) =>
      node.textContent?.includes("</script>"),
    );
    expect(escapedBlock).toBeTruthy();
    const escapedText = escapedBlock?.textContent ?? "";
    expect(escapedText).toContain(
      "const htmlSnippet = '<div data-note=\"<>&\"></div>';",
    );
    expect(escapedText).toContain('const scriptTag = "</script>";');
    expect(escapedText).toContain("`Render <, >, & safely`");
    expect(escapedBlock?.querySelector("script")).toBeNull();
    expect(escapedBlock?.querySelector("div")).toBeNull();

    const inlineCodes = Array.from(content.querySelectorAll("code")).filter(
      (node) => !node.closest("uik-code-block"),
    );
    expect(inlineCodes.length).toBeGreaterThan(0);
    inlineCodes.forEach((node) => {
      expect(node.closest("uik-code-block")).toBeNull();
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
            innerRule.cssText.includes(".docs-code-block"),
          );
        });
      },
    );
    expect(hasForcedColorsRule).toBe(true);
  });

  it("renders example fences with preview and copyable code", async () => {
    window.history.replaceState({}, "", "/lab/markdown-rendering");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");

    await customElements.whenDefined("uik-example");
    const example = content.querySelector<HTMLElement>("uik-example");
    if (!example) throw new Error("Expected example fence to render.");

    const previewSlot = example.querySelector<HTMLElement>('[slot="preview"]');
    expect(previewSlot).toBeTruthy();

    const codeBlock = example.querySelector<HTMLElement>(
      'uik-code-block[slot="code"]',
    );
    expect(codeBlock).toBeTruthy();

    const tabs = example.shadowRoot?.querySelector<HTMLElement>("uik-tabs");
    expect(tabs).toBeTruthy();
    const codeTab = tabs?.querySelector<HTMLElement>('uik-tab[value="code"]');
    codeTab?.click();
    await (tabs as unknown as { updateComplete: Promise<void> }).updateComplete;

    const codePanel = tabs?.querySelector<HTMLElement>(
      'uik-tab-panel[value="code"]',
    );
    expect(codePanel?.hasAttribute("hidden")).toBe(false);

    const copyButton =
      codeBlock?.shadowRoot?.querySelector<HTMLButtonElement>("button.copy");
    expect(copyButton).toBeTruthy();

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      copyButton?.click();
      await (codeBlock as unknown as { updateComplete: Promise<void> })
        .updateComplete;
      expect(writeText).toHaveBeenCalled();
    } finally {
      if (originalClipboard) {
        Object.defineProperty(navigator, "clipboard", {
          value: originalClipboard,
          configurable: true,
        });
      } else {
        delete (navigator as typeof navigator & { clipboard?: Clipboard })
          .clipboard;
      }
    }

    const tokenBorderWidth = getComputedStyle(example)
      .getPropertyValue("--uik-component-example-border-width")
      .trim();
    expect(tokenBorderWidth).not.toBe("");

    const styleSheets = example.shadowRoot?.adoptedStyleSheets ?? [];
    const sheetText = styleSheets
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");
    const inlineStyles =
      example.shadowRoot?.querySelector("style")?.textContent ?? "";
    const combinedStyles = `${sheetText}\n${inlineStyles}`;
    expect(combinedStyles).toContain("@media (forced-colors: active)");
  });
});
