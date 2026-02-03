import type {
  UikButton,
  UikCommandPalette,
} from "@ismail-elkorchi/ui-primitives";
import "@ismail-elkorchi/ui-tokens/base.css";
import axe from "axe-core";
import type { Result } from "axe-core";
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

const waitForOptions = async (
  palette: UikCommandPalette | null,
  attempts = 5,
) => {
  if (!palette) return;
  for (let i = 0; i < attempts; i += 1) {
    const list = palette.shadowRoot?.querySelector(
      '[data-testid="command-palette-list"]',
    );
    if (list?.querySelector('[data-testid="command-palette-item"]')) return;
    await nextFrame();
  }
};

const waitForPaletteOpen = async (attempts = 10) => {
  for (let i = 0; i < attempts; i += 1) {
    const palette = document.querySelector<UikCommandPalette>(
      "[data-docs-command-palette]",
    );
    if (palette?.open) return palette;
    await nextFrame();
  }
  throw new Error("Command palette did not open.");
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

describe("command palette pattern", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState({}, "", "/docs/command-palette");
  });

  it("opens, searches, selects, and restores focus", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const openButton = document.querySelector<UikButton>(
      '[data-docs-action="command-palette-open"]',
    );
    expect(openButton).toBeTruthy();
    openButton?.focus();
    await userEvent.keyboard("{Control>}{KeyK}{/Control}");
    const palette = await waitForPaletteOpen();
    await palette?.updateComplete;
    await nextFrame();

    await userEvent.keyboard("{Escape}");
    await nextFrame();
    expect(palette?.open).toBe(false);
    expect(document.activeElement).toBe(openButton);

    openButton?.focus();
    await userEvent.keyboard("{Control>}{KeyK}{/Control}");
    await waitForPaletteOpen();
    await palette.updateComplete;
    await nextFrame();

    const input = palette?.shadowRoot?.querySelector<HTMLInputElement>("input");
    expect(input).toBeTruthy();
    if (input) {
      input.focus();
      await nextFrame();
      await userEvent.keyboard("Command palette");
      await nextFrame();
      await palette?.updateComplete;
      await waitForOptions(palette);
      const dialog = palette?.shadowRoot?.querySelector<HTMLElement>("dialog");
      if (!dialog) {
        throw new Error("Expected command palette dialog.");
      }
      await runA11y(dialog);
      await userEvent.keyboard("{ArrowDown}{Enter}");
      await nextFrame();
    }

    const title = document.querySelector("[data-docs-title]");
    expect(title).toBeTruthy();
    const titleText = (title as HTMLElement).textContent;
    if (!titleText) {
      throw new Error("Expected docs title text.");
    }
    expect(titleText.toLowerCase()).toMatch(/command[- ]palette/);
  });
});
