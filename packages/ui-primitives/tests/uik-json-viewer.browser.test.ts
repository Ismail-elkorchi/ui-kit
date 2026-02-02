import "@ismail-elkorchi/ui-tokens/index.css";
import axe from "axe-core";
import type { Result } from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import type {
  JsonViewerCopyDetail,
  UikJsonViewer,
} from "../src/atomic/content/uik-json-viewer";
import "../src/atomic/content/uik-json-viewer";
import { pressKey } from "./apg/keyboard";

const sample = {
  status: "ok",
  nested: {
    count: 2,
    list: ["alpha", "bravo"],
  },
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

describe("uik-json-viewer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("supports keyboard expand/collapse navigation", async () => {
    const viewer = document.createElement("uik-json-viewer") as UikJsonViewer;
    viewer.value = sample;
    viewer.expandedDepth = 0;
    document.body.append(viewer);

    await viewer.updateComplete;
    await nextFrame();

    let rootItem =
      viewer.shadowRoot?.querySelector<HTMLElement>('[data-item-id="$"]');
    if (!rootItem) throw new Error("Expected root item.");

    rootItem.focus();
    await viewer.updateComplete;
    expect(rootItem.getAttribute("aria-expanded")).toBe("false");

    await pressKey("ArrowRight");
    await viewer.updateComplete;

    rootItem =
      viewer.shadowRoot?.querySelector<HTMLElement>('[data-item-id="$"]');
    expect(rootItem?.getAttribute("aria-expanded")).toBe("true");
    expect(
      viewer.shadowRoot?.querySelector('[data-item-id="$.nested"]'),
    ).not.toBeNull();

    await pressKey("ArrowLeft");
    await viewer.updateComplete;

    rootItem =
      viewer.shadowRoot?.querySelector<HTMLElement>('[data-item-id="$"]');
    expect(rootItem?.getAttribute("aria-expanded")).toBe("false");
  });

  it("copies JSON values and emits events", async () => {
    const viewer = document.createElement("uik-json-viewer") as UikJsonViewer;
    viewer.value = sample;
    document.body.append(viewer);

    await viewer.updateComplete;
    await nextFrame();

    const copyButton = viewer.shadowRoot?.querySelector<HTMLButtonElement>(
      '[data-action="copy-value"]',
    );
    if (!copyButton) throw new Error("Expected copy button.");

    const originalClipboard = navigator.clipboard;
    const originalExecCommand = document.execCommand;
    const writeText = vi.fn().mockRejectedValue(new Error("blocked"));
    const execCommand = vi.fn(() => true);

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
    });

    try {
      const copyEvent = new Promise<CustomEvent<JsonViewerCopyDetail>>(
        (resolve) => {
          viewer.addEventListener(
            "json-viewer-copy",
            (event) => resolve(event as CustomEvent<JsonViewerCopyDetail>),
            { once: true },
          );
        },
      );
      copyButton.click();
      const event = await copyEvent;
      await viewer.updateComplete;

      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(event.detail.kind).toBe("value");
      expect(event.detail.path).toBe("$");
      expect(event.detail.value).toContain("status");

      const status = viewer.shadowRoot?.querySelector('[part="status"]');
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
      if (originalExecCommand) {
        Object.defineProperty(document, "execCommand", {
          value: originalExecCommand,
          configurable: true,
        });
      } else {
        delete (
          document as Document & { execCommand?: Document["execCommand"] }
        ).execCommand;
      }
    }
  });

  it("has zero axe violations", async () => {
    const viewer = document.createElement("uik-json-viewer") as UikJsonViewer;
    viewer.value = sample;
    document.body.append(viewer);

    await viewer.updateComplete;
    await nextFrame();

    const container =
      viewer.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    if (!container) throw new Error("Expected json viewer container.");

    await runA11y(container);
  });
});
