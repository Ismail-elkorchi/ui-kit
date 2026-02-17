import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UikBadge } from "../src/atomic/content/uik-badge";
import type { UikCodeBlockCopyDetail } from "../src/atomic/content/uik-code-block";
import type { UikHeading } from "../src/atomic/content/uik-heading";
import type { UikIcon } from "../src/atomic/content/uik-icon";
import type { UikText } from "../src/atomic/content/uik-text";
import type { UikVisuallyHidden } from "../src/atomic/content/uik-visually-hidden";
import type { UikAlert } from "../src/atomic/feedback/uik-alert";
import "../src/atomic/content/uik-badge";
import "../src/atomic/content/uik-code-block";
import "../src/atomic/content/uik-description-list";
import "../src/atomic/content/uik-heading";
import "../src/atomic/content/uik-icon";
import "../src/atomic/content/uik-text";
import "../src/atomic/content/uik-visually-hidden";
import "../src/atomic/feedback/uik-alert";

describe("uik content primitives", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders alerts with the correct role and optional title", async () => {
    const alert = document.createElement("uik-alert") as UikAlert;
    alert.textContent = "Notice";
    document.body.append(alert);

    await alert.updateComplete;

    const base = alert.shadowRoot?.querySelector('[part="base"]');
    const title = alert.shadowRoot?.querySelector('[part="title"]');
    expect(base?.getAttribute("role")).toBe("status");
    expect(title?.hasAttribute("hidden")).toBe(true);

    alert.variant = "danger";
    alert.innerHTML = '<span slot="title">Warning</span>Critical';
    await alert.updateComplete;

    const updatedBase = alert.shadowRoot?.querySelector('[part="base"]');
    const updatedTitle = alert.shadowRoot?.querySelector('[part="title"]');
    expect(updatedBase?.getAttribute("role")).toBe("alert");
    expect(updatedTitle?.hasAttribute("hidden")).toBe(false);
  });

  it("applies badge variants", async () => {
    const badge = document.createElement("uik-badge") as UikBadge;
    badge.variant = "outline";
    badge.textContent = "New";
    document.body.append(badge);

    await badge.updateComplete;

    const base = badge.shadowRoot?.querySelector('[part="base"]');
    expect(base?.classList.contains("variant-outline")).toBe(true);
  });

  it("renders heading levels within bounds", async () => {
    const heading = document.createElement("uik-heading") as UikHeading;
    heading.textContent = "Title";
    document.body.append(heading);

    const cases: [number, string][] = [
      [0, "h1"],
      [2, "h2"],
      [3, "h3"],
      [4, "h4"],
      [5, "h5"],
      [7, "h6"],
    ];

    for (const [level, tag] of cases) {
      heading.level = level;
      await heading.updateComplete;
      expect(heading.shadowRoot?.querySelector(tag)).not.toBeNull();
    }
  });

  it("renders icons with aria attributes when provided", async () => {
    const icon = document.createElement("uik-icon") as UikIcon;
    icon.innerHTML = "<svg></svg>";
    document.body.append(icon);

    await icon.updateComplete;

    const base = icon.shadowRoot?.querySelector('[part="base"]');
    expect(base?.getAttribute("role")).toBeNull();

    icon.ariaLabelValue = "Search";
    icon.ariaHiddenValue = "true";
    await icon.updateComplete;

    const labeled = icon.shadowRoot?.querySelector('[part="base"]');
    expect(labeled?.getAttribute("role")).toBe("img");
    expect(labeled?.getAttribute("aria-label")).toBe("Search");
    expect(labeled?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders text with different tags", async () => {
    const text = document.createElement("uik-text") as UikText;
    text.textContent = "Copy";
    document.body.append(text);

    await text.updateComplete;
    expect(text.shadowRoot?.querySelector("span")).not.toBeNull();

    text.as = "p";
    await text.updateComplete;
    expect(text.shadowRoot?.querySelector("p")).not.toBeNull();

    text.as = "div";
    await text.updateComplete;
    expect(text.shadowRoot?.querySelector("div")).not.toBeNull();

    text.as = "label";
    await text.updateComplete;
    expect(text.shadowRoot?.querySelector("label")).not.toBeNull();
  });

  it("renders visually hidden content", async () => {
    const hidden = document.createElement(
      "uik-visually-hidden",
    ) as UikVisuallyHidden;
    hidden.textContent = "Hidden label";
    document.body.append(hidden);

    await hidden.updateComplete;

    const slot = hidden.shadowRoot?.querySelector("slot");
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(assigned[0]?.textContent).toContain("Hidden label");
  });

  it("renders description list slots and density", async () => {
    const list = document.createElement("uik-description-list");
    list.density = "compact";
    list.innerHTML = `
      <dt>Status</dt>
      <dd>Running</dd>
      <dt>Target</dt>
      <dd><code>0.2.0</code></dd>
    `;
    document.body.append(list);

    await list.updateComplete;

    const base = list.shadowRoot?.querySelector("dl");
    const slot = list.shadowRoot?.querySelector("slot");
    expect(base).not.toBeNull();
    expect(slot?.assignedElements({ flatten: true }).length).toBe(4);
    expect(list.getAttribute("density")).toBe("compact");
  });

  it("renders code block content and inline variant", async () => {
    const codeBlock = document.createElement("uik-code-block");
    codeBlock.textContent = "const status = 'ok';";
    document.body.append(codeBlock);

    await codeBlock.updateComplete;

    const pre = codeBlock.shadowRoot?.querySelector("pre");
    expect(pre).not.toBeNull();

    codeBlock.inline = true;
    await codeBlock.updateComplete;
    const inline = codeBlock.shadowRoot?.querySelector("code.inline");
    expect(inline).not.toBeNull();
  });

  it("copies code block content and announces status", async () => {
    const codeBlock = document.createElement("uik-code-block");
    codeBlock.copyable = true;
    codeBlock.textContent = "const status = 'ok';";
    document.body.append(codeBlock);

    await codeBlock.updateComplete;

    const copyButton =
      codeBlock.shadowRoot?.querySelector<HTMLButtonElement>("button.copy");
    expect(copyButton).not.toBeNull();

    const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
    const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "execCommand",
    );
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
      const copyEvent = new Promise<CustomEvent<UikCodeBlockCopyDetail>>(
        (resolve) => {
          codeBlock.addEventListener(
            "code-block-copy",
            (event) => resolve(event as CustomEvent<UikCodeBlockCopyDetail>),
            { once: true },
          );
        },
      );
      copyButton?.click();
      await copyEvent;
      await codeBlock.updateComplete;

      expect(execCommand).toHaveBeenCalledWith("copy");

      const status = codeBlock.shadowRoot?.querySelector(
        '[part="copy-status"]',
      );
      expect(status?.textContent).toContain("Copied");
    } finally {
      if (originalClipboardDescriptor) {
        Object.defineProperty(
          navigator,
          "clipboard",
          originalClipboardDescriptor,
        );
      } else {
        Reflect.deleteProperty(navigator, "clipboard");
      }
      if (originalExecCommandDescriptor) {
        Object.defineProperty(
          document,
          "execCommand",
          originalExecCommandDescriptor,
        );
      } else {
        Reflect.deleteProperty(document, "execCommand");
      }
    }
  });
});
