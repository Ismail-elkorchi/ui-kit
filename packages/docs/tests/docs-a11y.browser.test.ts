import axe from "axe-core";
import type { Result } from "axe-core";
import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, it } from "vitest";

import { mountDocsApp } from "../app";

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

describe("docs a11y", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("has zero axe violations on a representative route", async () => {
    window.history.replaceState({}, "", "/docs/getting-started");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
    await waitForContent();
    await runA11y(document.body);
  });
});
