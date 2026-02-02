import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  JsonDiffCopyDetail,
  UikJsonDiff,
} from "../src/atomic/content/uik-json-diff";
import "../src/atomic/content/uik-json-diff";
import { pressKey } from "./apg/keyboard";

const beforeValue = {
  status: "queued",
  flags: ["alpha"],
  meta: { count: 2 },
};

const afterValue = {
  status: "done",
  flags: ["alpha", "bravo"],
  meta: { count: 3 },
  extra: true,
};

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

describe("uik-json-diff", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders diff operations and supports keyboard navigation", async () => {
    const diff = document.createElement("uik-json-diff") as UikJsonDiff;
    diff.before = beforeValue;
    diff.after = afterValue;
    document.body.append(diff);

    await diff.updateComplete;
    await nextFrame();

    const items =
      diff.shadowRoot?.querySelectorAll<HTMLElement>('[part="item"]');
    expect(items?.length).toBeGreaterThan(0);

    const firstItem =
      diff.shadowRoot?.querySelector<HTMLElement>('[data-index="0"]');
    if (!firstItem) throw new Error("Expected first diff item.");

    firstItem.focus();
    await diff.updateComplete;

    await pressKey("ArrowDown");
    await diff.updateComplete;

    const focused =
      diff.shadowRoot?.querySelector<HTMLElement>('[data-index="1"]');
    expect(focused?.getAttribute("tabindex")).toBe("0");

    await pressKey("ArrowRight");
    await diff.updateComplete;

    const detail = diff.shadowRoot?.querySelector<HTMLElement>(
      ".detail:not([hidden])",
    );
    expect(detail).not.toBeNull();
  });

  it("copies diff values and emits events", async () => {
    const diff = document.createElement("uik-json-diff") as UikJsonDiff;
    diff.before = beforeValue;
    diff.after = afterValue;
    document.body.append(diff);

    await diff.updateComplete;
    await nextFrame();

    const copyButton = diff.shadowRoot?.querySelector<HTMLButtonElement>(
      '[data-action="copy-after"]',
    );
    if (!copyButton) throw new Error("Expected copy-after button.");

    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      const copyEvent = new Promise<CustomEvent<JsonDiffCopyDetail>>(
        (resolve) => {
          diff.addEventListener(
            "json-diff-copy",
            (event) => resolve(event as CustomEvent<JsonDiffCopyDetail>),
            { once: true },
          );
        },
      );
      copyButton.click();
      const event = await copyEvent;

      expect(event.detail.kind).toBe("after");
      expect(event.detail.path).toContain("$");
      expect(writeText).toHaveBeenCalled();

      const status = diff.shadowRoot?.querySelector('[part="status"]');
      expect(status?.textContent).toContain("Copied");
    } finally {
      if (originalClipboard) {
        Object.defineProperty(navigator, "clipboard", {
          value: originalClipboard,
          configurable: true,
        });
      } else {
        delete (navigator as typeof navigator & { clipboard?: Clipboard })
          .clipboard;
      }
    }
  });

  it("has zero axe violations", async () => {
    const diff = document.createElement("uik-json-diff") as UikJsonDiff;
    diff.before = beforeValue;
    diff.after = afterValue;
    document.body.append(diff);

    await diff.updateComplete;
    await nextFrame();

    const container =
      diff.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    if (!container) throw new Error("Expected json diff container.");

    await runA11y(container);
  });
});
