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

const landmarkSelector =
  "main,[role='main'],nav,[role='navigation'],aside,[role='complementary'],[role='region'],[role='search'],[role='banner'],[role='contentinfo']";

const findLandmarkAncestor = (element: Element) => {
  let current = element.parentElement;
  while (current) {
    if (current.matches(landmarkSelector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const assertLandmarkStructure = () => {
  const mains = Array.from(document.querySelectorAll("main,[role='main']"));
  if (mains.length !== 1) {
    throw new Error(
      `Expected exactly one main landmark; found ${mains.length}.`,
    );
  }

  const topLevelGroups: Array<{ label: string; selector: string }> = [
    { label: "banner", selector: "[role='banner']" },
    { label: "main", selector: "main,[role='main']" },
    { label: "complementary", selector: "aside,[role='complementary']" },
    { label: "contentinfo", selector: "[role='contentinfo']" },
  ];

  topLevelGroups.forEach(({ label, selector }) => {
    document.querySelectorAll(selector).forEach((element) => {
      const ancestor = findLandmarkAncestor(element);
      if (ancestor) {
        throw new Error(
          `Expected ${label} landmark to be top-level; found inside ${ancestor.tagName.toLowerCase()}.`,
        );
      }
    });
  });
};

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

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForContent = async (timeoutMs = 2000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    const isReady =
      content?.getAttribute("aria-busy") === "false" &&
      content.innerHTML.trim();
    if (isReady) return;
    await nextFrame();
  }
  throw new Error("Docs content did not render.");
};

describe("docs a11y", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  const routes = [
    { label: "home", path: "/docs/getting-started" },
    { label: "components", path: "/docs/primitives" },
    { label: "markdown", path: "/docs/baseline-support" },
  ];

  routes.forEach(({ label, path }) => {
    it(`has zero axe violations on ${label}`, async () => {
      window.history.replaceState({}, "", path);
      const root = document.getElementById("app");
      if (!root) throw new Error("Docs root not found.");
      await mountDocsApp(root);
      await waitForContent();
      assertLandmarkStructure();
      await runA11y(document.body);
    });
  });
});
