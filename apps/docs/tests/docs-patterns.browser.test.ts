import "@ismail-elkorchi/ui-tokens/base.css";
import axe from "axe-core";
import type { Result } from "axe-core";
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

function formatViolations(violations: Result[]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => {
          const target = node.target;
          return Array.isArray(target) ? target.join(" ") : String(target);
        })
        .join(", ");
      return `${violation.id}: ${violation.description}\n${targets}`;
    })
    .join("\n\n");
}

async function runA11y(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: true },
    },
  });

  if (results.violations.length > 0) {
    throw new Error(
      `A11y violations:\n${formatViolations(results.violations)}`,
    );
  }
}

describe("patterns docs", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders patterns index, recipes, and supports copy", async () => {
    window.history.replaceState({}, "", "/docs/patterns");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    await customElements.whenDefined("uik-section-card");
    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");
    const cards = content.querySelectorAll("uik-section-card");
    expect(cards.length).toBeGreaterThan(0);
    await runA11y(document.body);

    window.history.pushState({}, "", "/docs/empty-state");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitForContent();

    await customElements.whenDefined("uik-example");
    await customElements.whenDefined("uik-code-block");
    const emptyExample = content.querySelector<HTMLElement>("uik-example");
    if (!emptyExample) throw new Error("Expected empty state example.");
    const previewSlot = emptyExample.querySelector<HTMLElement>('[slot="preview"]');
    expect(previewSlot?.querySelector("uik-empty-state")).toBeTruthy();

    const codeBlock = emptyExample.querySelector<HTMLElement>("uik-code-block");
    if (!codeBlock) throw new Error("Expected code block for example.");
    const copyButton = codeBlock.shadowRoot?.querySelector<HTMLButtonElement>(
      '[part="copy-button"]',
    );
    if (!copyButton) throw new Error("Expected code block copy button.");

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      const copyEvent = new Promise<CustomEvent>((resolve) => {
        codeBlock.addEventListener(
          "code-block-copy",
          (event) => resolve(event as CustomEvent),
          { once: true },
        );
      });
      copyButton.click();
      const event = await copyEvent;
      expect(event.detail.success).toBe(true);
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

    window.history.pushState({}, "", "/docs/apply-preview");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitForContent();

    await customElements.whenDefined("uik-json-diff");
    const diff = content.querySelector("uik-json-diff");
    expect(diff).toBeTruthy();
    await runA11y(document.body);
  });
});
