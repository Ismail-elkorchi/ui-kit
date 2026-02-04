import "@ismail-elkorchi/ui-tokens/base.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

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

describe("docs examples", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders examples index and interactive example panels", async () => {
    window.history.replaceState({}, "", "/docs/examples");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (!content) throw new Error("Docs content root not found.");
    const cards = content.querySelectorAll("[data-example-card]");
    expect(cards.length).toBeGreaterThanOrEqual(4);
    await runA11y(document.body);

    window.history.pushState({}, "", "/docs/examples/settings-form");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitForContent();

    await customElements.whenDefined("uik-example");
    await customElements.whenDefined("uik-select");
    await customElements.whenDefined("uik-code-block");
    await customElements.whenDefined("uik-tag-input");

    const tagInput = content.querySelector("uik-tag-input") as
      | (HTMLElement & { values?: string[] })
      | null;
    if (!tagInput) throw new Error("Tag input not found.");
    const tagInputField =
      tagInput.shadowRoot?.querySelector<HTMLInputElement>("input");
    if (!tagInputField) throw new Error("Tag input field not found.");

    await userEvent.click(tagInputField);
    await userEvent.type(tagInputField, "ops{Enter}");
    await nextFrame();
    expect(tagInput.values?.includes("ops")).toBe(true);

    const densityExample = content.querySelector<HTMLElement>(
      'uik-example[data-example="settings-density"]',
    );
    if (!densityExample) throw new Error("Density example not found.");

    const previewComfortable = densityExample.querySelector<HTMLElement>(
      '[slot="preview"][data-variant="comfortable"]',
    );
    const previewCompact = densityExample.querySelector<HTMLElement>(
      '[slot="preview"][data-variant="compact"]',
    );
    expect(previewComfortable?.hasAttribute("hidden")).toBe(false);
    expect(previewCompact?.hasAttribute("hidden")).toBe(true);
    expect(previewComfortable?.querySelector("uik-section-card")).toBeTruthy();

    const select = densityExample.querySelector<HTMLElement>(
      'uik-select[slot="controls"]',
    ) as (HTMLElement & { value?: string }) | null;
    if (!select) throw new Error("Density select not found.");

    select.value = "compact";
    select.dispatchEvent(
      new Event("change", { bubbles: true, composed: true }),
    );
    await nextFrame();
    await (densityExample as unknown as { updateComplete: Promise<void> })
      .updateComplete;

    expect(previewCompact?.hasAttribute("hidden")).toBe(false);
    expect(previewComfortable?.hasAttribute("hidden")).toBe(true);

    const activeCodeBlock = densityExample.querySelector<HTMLElement>(
      'uik-code-block[slot="code"]:not([hidden])',
    );
    if (!activeCodeBlock) throw new Error("Active code block missing.");
    const copyButton =
      activeCodeBlock.shadowRoot?.querySelector<HTMLButtonElement>(
        "button.copy",
      );
    if (!copyButton) throw new Error("Copy button missing.");

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      const copyEvent = new Promise<CustomEvent>((resolve) => {
        activeCodeBlock.addEventListener(
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

    await runA11y(document.body);

    window.history.pushState({}, "", "/docs/examples/apply-preview");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitForContent();

    await customElements.whenDefined("uik-json-diff");
    const diff = content.querySelector("uik-json-diff");
    expect(diff).toBeTruthy();
    await runA11y(document.body);
  });
});
