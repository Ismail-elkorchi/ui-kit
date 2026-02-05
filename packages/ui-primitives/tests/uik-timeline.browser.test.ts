import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikTimeline } from "../src/atomic/content/uik-timeline";
import { styles as timelineStyles } from "../src/atomic/content/uik-timeline/styles";
import "../src/atomic/content/uik-timeline";

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

describe("uik-timeline", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders items from json-items", async () => {
    const timeline = document.createElement("uik-timeline") as UikTimeline;
    timeline.setAttribute("aria-label", "Run history");
    timeline.setAttribute(
      "json-items",
      JSON.stringify([
        {
          title: "Deploy started",
          description: "Queued release for staging.",
          meta: "Just now",
          status: "Queued",
        },
        {
          title: "Deploy finished",
          description: "Published to production.",
          meta: "2 minutes ago",
          status: "Success",
        },
      ]),
    );
    document.body.append(timeline);

    await timeline.updateComplete;
    await nextFrame();

    const items = timeline.shadowRoot?.querySelectorAll("[part='item']");
    expect(items?.length).toBe(2);
    const titles = timeline.shadowRoot?.querySelectorAll("[part='title']");
    expect(titles?.[0]?.textContent).toContain("Deploy started");
  });

  it("has zero axe violations", async () => {
    const timeline = document.createElement("uik-timeline") as UikTimeline;
    timeline.setAttribute("aria-label", "Run history");
    timeline.items = [
      { title: "Queued", description: "Waiting for approval." },
      { title: "Running", meta: "2 minutes ago" },
    ];
    document.body.append(timeline);

    await timeline.updateComplete;
    await nextFrame();

    const container =
      timeline.shadowRoot?.querySelector<HTMLElement>("[part='base']");
    if (!container) throw new Error("Timeline base missing.");
    await runA11y(container);
  });

  it("includes forced-colors fallback styling", () => {
    const cssText =
      "cssText" in timelineStyles
        ? timelineStyles.cssText
        : String(timelineStyles);
    expect(cssText).toContain("@media (forced-colors: active)");
  });
});
