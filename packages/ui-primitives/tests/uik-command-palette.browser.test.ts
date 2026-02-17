import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikCommandPaletteSelectDetail } from "../src/composed/overlay/uik-command-palette";
import "../src/composed/overlay/uik-command-palette";
import { styles as commandPaletteStyles } from "../src/composed/overlay/uik-command-palette/styles";

const items = [
  {
    id: "alpha",
    label: "Alpha",
    description: "First command",
  },
  {
    id: "bravo",
    label: "Bravo",
    description: "Disabled command",
    isDisabled: true,
  },
  {
    id: "charlie",
    label: "Charlie",
    description: "Third command",
  },
];

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

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

describe("uik-command-palette", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("navigates and selects with keyboard", async () => {
    const palette = document.createElement("uik-command-palette");
    palette.items = items;
    palette.innerHTML = `
      <span slot="title">Command palette</span>
      <span slot="description">Pick a command.</span>
      <span slot="label">Search commands</span>
    `;
    document.body.append(palette);

    palette.open = true;
    await palette.updateComplete;
    await nextFrame();

    const input = palette.shadowRoot?.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("Expected command palette input.");

    let selected = "";
    palette.addEventListener("command-palette-select", (event) => {
      selected = (event as CustomEvent<UikCommandPaletteSelectDetail>).detail
        .item.id;
    });

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await palette.updateComplete;

    const activeItem = palette.shadowRoot?.querySelector(
      '[data-active="true"]',
    ) as HTMLElement | null;
    expect(activeItem?.textContent).toContain("Charlie");

    await userEvent.keyboard("{Enter}");
    await palette.updateComplete;

    expect(selected).toBe("charlie");
    expect(palette.open).toBe(false);
  });

  it("restores focus to the opener on escape", async () => {
    const opener = document.createElement("button");
    opener.textContent = "Open palette";
    document.body.append(opener);
    opener.focus();

    const palette = document.createElement("uik-command-palette");
    palette.items = items;
    palette.innerHTML = `
      <span slot="title">Command palette</span>
      <span slot="label">Search commands</span>
    `;
    document.body.append(palette);

    palette.open = true;
    await palette.updateComplete;

    const input = palette.shadowRoot?.querySelector<HTMLInputElement>("input");
    input?.focus();
    await userEvent.keyboard("{Escape}");
    await palette.updateComplete;

    expect(palette.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it("has zero axe violations", async () => {
    const palette = document.createElement("uik-command-palette");
    palette.items = items;
    palette.innerHTML = `
      <span slot="title">Command palette</span>
      <span slot="description">Pick a command.</span>
      <span slot="label">Search commands</span>
    `;
    document.body.append(palette);

    palette.open = true;
    await palette.updateComplete;
    await nextFrame();

    const dialog = palette.shadowRoot?.querySelector<HTMLElement>("dialog");
    if (!dialog) {
      throw new Error("Expected command palette dialog.");
    }

    await runA11y(dialog);
  });

  it("includes reduced-motion and forced-colors fallbacks", () => {
    const cssText =
      "cssText" in commandPaletteStyles
        ? commandPaletteStyles.cssText
        : String(commandPaletteStyles);
    expect(cssText).toContain("@media (prefers-reduced-motion: reduce)");
    expect(cssText).toContain("@media (forced-colors: active)");
  });
});
