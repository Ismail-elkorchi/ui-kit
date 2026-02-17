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

describe("docs activity feed example", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders the activity feed example", async () => {
    window.history.replaceState({}, "", "/docs/examples/activity-feed");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    await customElements.whenDefined("uik-example");
    await customElements.whenDefined("uik-timeline");
    await customElements.whenDefined("uik-code-block");

    const example = document.querySelector("uik-example");
    expect(example).toBeTruthy();

    const timeline = document.querySelector("uik-timeline");
    expect(timeline).toBeTruthy();

    const codeBlock = document.querySelector<HTMLElement>(
      "uik-code-block[copyable]",
    );
    if (!codeBlock) throw new Error("Copyable code block missing.");

    const copyButton =
      codeBlock.shadowRoot?.querySelector<HTMLButtonElement>("button.copy");
    if (!copyButton) throw new Error("Copy button missing.");

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      const copyEvent = new Promise<CustomEvent<{ success: boolean }>>(
        (resolve) => {
          codeBlock.addEventListener(
            "code-block-copy",
            (event) => resolve(event as CustomEvent<{ success: boolean }>),
            { once: true },
          );
        },
      );
      copyButton.click();
      const event = await copyEvent;
      expect(event.detail.success).toBe(true);
      expect(writeText).toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }

    await runA11y(document.body);
  });
});
