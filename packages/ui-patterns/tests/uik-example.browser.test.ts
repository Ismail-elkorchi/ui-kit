import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikExample } from "../src/patterns/uik-example";
import "../src/patterns/uik-example";

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

    const header = example.shadowRoot?.querySelector('[part="header"]');
    const tabs = example.shadowRoot?.querySelector("uik-tabs");
    const preview = example.shadowRoot?.querySelector('[part="preview"]');
    const code = example.shadowRoot?.querySelector('[part="code"]');

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

  it("switches preview variants from controls", async () => {
    const example = document.createElement("uik-example") as UikExample;
    example.variant = "comfortable";
    example.innerHTML = `
      <uik-tabs slot="controls" activation="manual">
        <uik-tab slot="tab" value="comfortable">Comfortable</uik-tab>
        <uik-tab slot="tab" value="compact">Compact</uik-tab>
      </uik-tabs>
      <div slot="preview" data-variant="comfortable">Comfortable preview</div>
      <div slot="preview" data-variant="compact">Compact preview</div>
      <div slot="code" data-variant="comfortable">Comfortable code</div>
      <div slot="code" data-variant="compact">Compact code</div>
    `;
    document.body.append(example);

    await example.updateComplete;
    await nextFrame();

    const previewComfortable = example.querySelector<HTMLElement>(
      '[slot="preview"][data-variant="comfortable"]',
    );
    const previewCompact = example.querySelector<HTMLElement>(
      '[slot="preview"][data-variant="compact"]',
    );
    if (!previewComfortable || !previewCompact) {
      throw new Error("Expected preview variants.");
    }
    expect(previewComfortable.hasAttribute("hidden")).toBe(false);
    expect(previewCompact.hasAttribute("hidden")).toBe(true);

    const tabs = example.querySelector("uik-tabs");
    if (!tabs) throw new Error("Expected controls tabs.");
    tabs.dispatchEvent(
      new CustomEvent("tabs-select", {
        detail: { id: "compact" },
        bubbles: true,
        composed: true,
      }),
    );

    await example.updateComplete;
    await nextFrame();

    expect(example.variant).toBe("compact");
    expect(previewComfortable.hasAttribute("hidden")).toBe(true);
    expect(previewCompact.hasAttribute("hidden")).toBe(false);
  });
});
