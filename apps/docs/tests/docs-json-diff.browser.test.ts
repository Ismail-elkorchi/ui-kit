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

describe("docs json diff page", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders json diff examples and supports copy", async () => {
    window.history.replaceState({}, "", "/docs/diff-preview");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");

    await customElements.whenDefined("uik-example");
    await customElements.whenDefined("uik-json-diff");

    const example = content.querySelector<HTMLElement>("uik-example");
    if (!example) throw new Error("Expected json diff example.");

    const previewSlot = example.querySelector<HTMLElement>('[slot="preview"]');
    expect(previewSlot).toBeTruthy();

    const diff = previewSlot?.querySelector<HTMLElement>("uik-json-diff");
    if (!diff) throw new Error("Expected uik-json-diff in preview.");

    const copyButton = diff.shadowRoot?.querySelector<HTMLButtonElement>(
      '[data-action="copy-path"]',
    );
    if (!copyButton) throw new Error("Expected json diff copy button.");

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      const copyEvent = new Promise<CustomEvent>((resolve) => {
        diff.addEventListener(
          "json-diff-copy",
          (event) => resolve(event as CustomEvent),
          { once: true },
        );
      });
      copyButton.click();
      const event = await copyEvent;

      expect(event.detail.kind).toBe("path");
      expect(event.detail.path).toContain("$");
      expect(writeText).toHaveBeenCalled();

      const status = diff.shadowRoot?.querySelector('[part="status"]');
      expect(status?.textContent).toContain("Copied");
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
  });
});
