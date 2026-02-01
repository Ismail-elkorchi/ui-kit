import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikEmptyState } from "../src/patterns/uik-empty-state";
import "../src/patterns/uik-empty-state";

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

describe("uik-empty-state", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders content slots", async () => {
    const emptyState = document.createElement(
      "uik-empty-state",
    ) as UikEmptyState;
    emptyState.innerHTML = `
      <span slot="title">No items yet</span>
      <span slot="description">Create your first item to get started.</span>
      <button slot="actions">Create item</button>
      <span>Optional supporting copy.</span>
    `;
    document.body.append(emptyState);

    await emptyState.updateComplete;

    const base = emptyState.shadowRoot?.querySelector("uik-surface");
    const title = emptyState.shadowRoot?.querySelector('[part="title"]');
    const description = emptyState.shadowRoot?.querySelector(
      '[part="description"]',
    );
    const actions = emptyState.shadowRoot?.querySelector('[part="actions"]');
    const body = emptyState.shadowRoot?.querySelector(".body");

    expect(base).not.toBeNull();
    expect(title?.hasAttribute("hidden")).toBe(false);
    expect(description?.hasAttribute("hidden")).toBe(false);
    expect(actions?.hasAttribute("hidden")).toBe(false);
    expect(body?.hasAttribute("hidden")).toBe(false);
  });

  it("has zero axe violations", async () => {
    const emptyState = document.createElement(
      "uik-empty-state",
    ) as UikEmptyState;
    emptyState.innerHTML = `
      <span slot="title">No items yet</span>
      <span slot="description">Create your first item to get started.</span>
      <button slot="actions">Create item</button>
    `;
    document.body.append(emptyState);

    await emptyState.updateComplete;

    const content =
      emptyState.shadowRoot?.querySelector<HTMLElement>('[part="content"]');
    if (!content) {
      throw new Error("Expected empty state content.");
    }

    await runA11y(content);
  });
});
