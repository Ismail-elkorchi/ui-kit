import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikPageHero } from "../src/patterns/uik-page-hero";
import "../src/patterns/uik-page-hero";

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

describe("uik-page-hero", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders hero slots", async () => {
    const hero = document.createElement("uik-page-hero") as UikPageHero;
    hero.innerHTML = `
      <span slot="eyebrow">Project</span>
      <span slot="title">Design system overview</span>
      <span slot="summary">Track adoption and tokens.</span>
      <span slot="links">Links</span>
      <span slot="panel">Panel content</span>
    `;
    document.body.append(hero);

    await hero.updateComplete;

    const base = hero.shadowRoot?.querySelector("uik-surface");
    const eyebrow = hero.shadowRoot?.querySelector('[part="eyebrow"]');
    const title = hero.shadowRoot?.querySelector('[part="title"]');
    const summary = hero.shadowRoot?.querySelector('[part="summary"]');
    const links = hero.shadowRoot?.querySelector('[part="links"]');
    const panel = hero.shadowRoot?.querySelector('[part="panel"]');

    expect(base).not.toBeNull();
    expect(eyebrow?.hasAttribute("hidden")).toBe(false);
    expect(title?.hasAttribute("hidden")).toBe(false);
    expect(summary?.hasAttribute("hidden")).toBe(false);
    expect(links?.hasAttribute("hidden")).toBe(false);
    expect(panel?.hasAttribute("hidden")).toBe(false);
  });

  it("has zero axe violations", async () => {
    const hero = document.createElement("uik-page-hero") as UikPageHero;
    hero.innerHTML = `
      <span slot="title">Design system overview</span>
      <span slot="summary">Track adoption and tokens.</span>
    `;
    document.body.append(hero);

    await hero.updateComplete;

    const content =
      hero.shadowRoot?.querySelector<HTMLElement>('[part="content"]');
    if (!content) {
      throw new Error("Expected hero content.");
    }

    await runA11y(content);
  });
});
