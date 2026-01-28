import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikSectionCard } from "../src/patterns/uik-section-card";
import "../src/patterns/uik-section-card";

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
      "landmark-complementary-is-top-level": { enabled: false },
      "landmark-contentinfo-is-top-level": { enabled: false },
      "landmark-main-is-top-level": { enabled: false },
    },
  });

  if (results.violations.length > 0) {
    throw new Error(
      `A11y violations:\n${formatViolations(results.violations)}`,
    );
  }
}

describe("uik-section-card", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders slotted content", async () => {
    const card = document.createElement("uik-section-card") as UikSectionCard;
    card.innerHTML = `
      <span slot="title">Workspace settings</span>
      <span slot="actions">Edit</span>
      <span>Body copy</span>
    `;
    document.body.append(card);

    await card.updateComplete;

    const base = card.shadowRoot?.querySelector("uik-surface");
    const header = card.shadowRoot?.querySelector('[part="header"]');
    const title = card.shadowRoot?.querySelector('[part="title"]');
    const actions = card.shadowRoot?.querySelector('[part="actions"]');
    const body = card.shadowRoot?.querySelector('[part="body"]');

    expect(base).not.toBeNull();
    expect(header?.hasAttribute("hidden")).toBe(false);
    expect(title?.hasAttribute("hidden")).toBe(false);
    expect(actions?.hasAttribute("hidden")).toBe(false);
    expect(body?.hasAttribute("hidden")).toBe(false);
  });

  it("has zero axe violations", async () => {
    const card = document.createElement("uik-section-card") as UikSectionCard;
    card.innerHTML = `
      <span slot="title">Workspace settings</span>
      <span>Body copy</span>
    `;
    document.body.append(card);

    await card.updateComplete;

    const content =
      card.shadowRoot?.querySelector<HTMLElement>('[part="content"]');
    if (!content) {
      throw new Error("Expected section card content.");
    }

    await runA11y(content);
  });
});
