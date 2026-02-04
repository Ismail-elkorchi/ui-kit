import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type {
  TagInputAddDetail,
  TagInputRemoveDetail,
  UikTagInput,
} from "../src/composed/collection/uik-tag-input";
import { styles as tagInputStyles } from "../src/composed/collection/uik-tag-input/styles";
import "../src/composed/collection/uik-tag-input";

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

describe("uik-tag-input", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("adds and removes tags with keyboard input", async () => {
    const tagInput = document.createElement("uik-tag-input") as UikTagInput;
    tagInput.setAttribute("aria-label", "Tags");
    document.body.append(tagInput);

    await tagInput.updateComplete;
    await nextFrame();

    const input = tagInput.shadowRoot?.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("Expected tag input field.");

    const addEvent = new Promise<CustomEvent<TagInputAddDetail>>((resolve) => {
      tagInput.addEventListener(
        "tag-input-add",
        (event) => resolve(event as CustomEvent<TagInputAddDetail>),
        { once: true },
      );
    });

    await userEvent.click(input);
    await userEvent.type(input, "alpha{Enter}");

    const added = await addEvent;
    await tagInput.updateComplete;
    expect(added.detail.value).toBe("alpha");
    expect(tagInput.values).toContain("alpha");

    await userEvent.keyboard("{ArrowLeft}");
    const active = tagInput.shadowRoot?.activeElement as HTMLElement | null;
    expect(active?.classList.contains("tag")).toBe(true);

    const removeEvent = new Promise<CustomEvent<TagInputRemoveDetail>>(
      (resolve) => {
        tagInput.addEventListener(
          "tag-input-remove",
          (event) => resolve(event as CustomEvent<TagInputRemoveDetail>),
          { once: true },
        );
      },
    );

    await userEvent.keyboard("{Backspace}");
    const removed = await removeEvent;
    await tagInput.updateComplete;
    expect(removed.detail.value).toBe("alpha");
    expect(tagInput.values).not.toContain("alpha");
  });

  it("has zero axe violations", async () => {
    const tagInput = document.createElement("uik-tag-input") as UikTagInput;
    tagInput.setAttribute("aria-label", "Tags");
    tagInput.values = ["alpha", "bravo"];
    document.body.append(tagInput);

    await tagInput.updateComplete;
    await nextFrame();

    const container =
      tagInput.shadowRoot?.querySelector<HTMLElement>("[part=base]");
    if (!container) throw new Error("Expected tag input base.");
    await runA11y(container);
  });

  it("includes forced-colors fallback styling", () => {
    const cssText =
      "cssText" in tagInputStyles
        ? tagInputStyles.cssText
        : String(tagInputStyles);
    expect(cssText).toContain("@media (forced-colors: active)");
  });
});
