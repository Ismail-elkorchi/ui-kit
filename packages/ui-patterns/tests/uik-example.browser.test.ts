import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikExample } from "../src/patterns/uik-example";
import "../src/patterns/uik-example";

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

describe("uik-example", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders preview and code slots", async () => {
    const example = document.createElement("uik-example") as UikExample;
    example.title = "Preview + Code";
    example.innerHTML = `
      <div slot="preview">Preview content</div>
      <div slot="code">Code content</div>
    `;
    document.body.append(example);

    await example.updateComplete;

    const header = example.shadowRoot?.querySelector([(part = header)]);
    const tabs = example.shadowRoot?.querySelector("uik-tabs");
    const preview = example.shadowRoot?.querySelector([(part = preview)]);
    const code = example.shadowRoot?.querySelector([(part = code)]);

    expect(header?.hasAttribute("hidden")).toBe(false);
    expect(tabs).toBeTruthy();
    expect(preview).toBeTruthy();
    expect(code).toBeTruthy();
  });

  it("has zero axe violations", async () => {
    const example = document.createElement("uik-example") as UikExample;
    example.innerHTML = `
      <div slot="preview">Preview content</div>
      <div slot="code">Code content</div>
    `;
    document.body.append(example);

    await example.updateComplete;

    const surface =
      example.shadowRoot?.querySelector<HTMLElement>("uik-surface");
    if (!surface) {
      throw new Error("Expected example surface.");
    }

    await runA11y(surface);
  });
});
