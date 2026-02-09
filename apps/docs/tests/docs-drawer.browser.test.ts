import type { UikButton } from "@ismail-elkorchi/ui-primitives";
import type {
  UikShellLayout,
  UikShellSecondarySidebar,
} from "@ismail-elkorchi/ui-shell";
import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { mountDocsApp } from "../app";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForContent = async (timeoutMs = 2000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    if (content?.innerHTML.trim()) return;
    await nextFrame();
  }
  throw new Error("Docs content did not render.");
};

const waitForNarrowLayout = async (
  layout: UikShellLayout,
  timeoutMs = 2000,
) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (layout.hasAttribute("data-shell-narrow")) return;
    await nextFrame();
  }
  throw new Error("Shell layout did not enter narrow mode.");
};

const waitForWideLayout = async (layout: UikShellLayout, timeoutMs = 2000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (!layout.hasAttribute("data-shell-narrow")) return;
    await nextFrame();
  }
  throw new Error("Shell layout did not return to wide mode.");
};

const waitForHash = async (expectedHash: string, timeoutMs = 2000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (window.location.hash === expectedHash) return;
    await nextFrame();
  }
  throw new Error(`Hash did not update to ${expectedHash}.`);
};

describe("docs outline drawer focus", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState({}, "", "/docs/getting-started");
  });

  it("shows TOC on desktop and TOC links scroll to headings", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const layout = document.querySelector<UikShellLayout>("uik-shell-layout");
    const outlineToggle = document.querySelector<UikButton>(
      '[data-docs-action="outline-toggle"]',
    );
    const secondarySidebar = document.querySelector<UikShellSecondarySidebar>(
      "uik-shell-secondary-sidebar",
    );
    if (!layout || !outlineToggle || !secondarySidebar) {
      throw new Error("Docs shell not found.");
    }

    layout.style.setProperty(
      "--uik-component-shell-collapse-breakpoint",
      "40rem",
    );
    layout.style.width = "70rem";
    await waitForWideLayout(layout);

    expect(layout.hasAttribute("data-shell-narrow")).toBe(false);
    if (!secondarySidebar.isOpen) {
      await userEvent.click(outlineToggle);
      await secondarySidebar.updateComplete;
      await nextFrame();
    }
    expect(secondarySidebar.isOpen).toBe(true);

    const tocLink = secondarySidebar.querySelector<HTMLElement>(
      '[data-docs-outline] a.docs-toc-link[href^="#"]',
    );
    if (!tocLink) throw new Error("Expected at least one TOC link.");
    const href = tocLink.getAttribute("href");
    if (!href || href === "#") throw new Error("Expected hash href.");

    const targetId = decodeURIComponent(href.slice(1));
    const target = document.getElementById(targetId);
    if (!target) throw new Error(`Target section not found for ${href}.`);

    const scrollSpy = vi.fn();
    Object.defineProperty(target, "scrollIntoView", {
      configurable: true,
      value: scrollSpy,
    });

    window.location.hash = href;
    window.dispatchEvent(new Event("hashchange"));
    await waitForHash(href);
    await nextFrame();
    await nextFrame();

    expect(scrollSpy).toHaveBeenCalled();
  });

  it("sets initial focus inside the drawer and restores focus on close", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const outlineToggle = document.querySelector<UikButton>(
      '[data-docs-action="outline-toggle"]',
    );
    const secondarySidebar = document.querySelector<UikShellSecondarySidebar>(
      "uik-shell-secondary-sidebar",
    );
    expect(outlineToggle).toBeTruthy();
    expect(secondarySidebar).toBeTruthy();
    if (!outlineToggle || !secondarySidebar) return;

    if (secondarySidebar.isOpen) {
      const closeButton = secondarySidebar.querySelector<UikButton>(
        'uik-button[part="close-button"]',
      );
      if (closeButton) {
        await userEvent.click(closeButton);
      } else {
        const layout =
          document.querySelector<UikShellLayout>("uik-shell-layout");
        secondarySidebar.isOpen = false;
        if (layout) layout.isSecondarySidebarVisible = false;
      }
      await secondarySidebar.updateComplete;
    }

    expect(secondarySidebar.isOpen).toBe(false);
    expect(document.activeElement).toBe(outlineToggle);

    await userEvent.click(outlineToggle);
    await secondarySidebar.updateComplete;
    await nextFrame();

    const active = document.activeElement as HTMLElement | null;
    expect(active).toBeTruthy();
    expect(secondarySidebar.contains(active)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await secondarySidebar.updateComplete;
    await nextFrame();

    expect(secondarySidebar.isOpen).toBe(false);
    expect(document.activeElement).toBe(outlineToggle);
  });

  it("keeps TOC hidden in narrow mode until toggled and restores focus on close", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const layout = document.querySelector<UikShellLayout>("uik-shell-layout");
    const outlineToggle = document.querySelector<UikButton>(
      '[data-docs-action="outline-toggle"]',
    );
    const secondarySidebar = document.querySelector<UikShellSecondarySidebar>(
      "uik-shell-secondary-sidebar",
    );
    if (!layout || !outlineToggle || !secondarySidebar) {
      throw new Error("Docs shell controls not found.");
    }

    layout.style.setProperty(
      "--uik-component-shell-collapse-breakpoint",
      "40rem",
    );
    layout.style.width = "22rem";
    await waitForNarrowLayout(layout);

    const secondaryRegion = layout.querySelector<HTMLElement>(
      '[data-region="secondary-sidebar"]',
    );
    if (!secondaryRegion) throw new Error("Secondary region not found.");

    expect(secondarySidebar.isOpen).toBe(false);
    expect(secondaryRegion.getAttribute("aria-hidden")).toBe("true");
    expect(secondaryRegion.hasAttribute("inert")).toBe(true);

    await userEvent.click(outlineToggle);
    await secondarySidebar.updateComplete;
    await nextFrame();

    expect(secondarySidebar.isOpen).toBe(true);
    expect(secondaryRegion.hasAttribute("inert")).toBe(false);
    const active = document.activeElement as HTMLElement | null;
    expect(active).toBeTruthy();
    expect(secondarySidebar.contains(active)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await secondarySidebar.updateComplete;
    await nextFrame();

    expect(secondarySidebar.isOpen).toBe(false);
    expect(secondaryRegion.getAttribute("aria-hidden")).toBe("true");
    expect(secondaryRegion.hasAttribute("inert")).toBe(true);
    expect(document.activeElement).toBe(outlineToggle);
  });

  it("retains outline content after close/reopen in wide and narrow layouts", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const layout = document.querySelector<UikShellLayout>("uik-shell-layout");
    const outlineToggle = document.querySelector<UikButton>(
      '[data-docs-action="outline-toggle"]',
    );
    const secondarySidebar = document.querySelector<UikShellSecondarySidebar>(
      "uik-shell-secondary-sidebar",
    );
    if (!layout || !outlineToggle || !secondarySidebar) {
      throw new Error("Docs shell controls not found.");
    }

    const initialItem = secondarySidebar.querySelector<HTMLElement>(
      "[data-docs-outline] a, [data-docs-outline] li, [data-docs-outline] span",
    );
    if (!initialItem) throw new Error("Outline item not found.");
    const initialText = initialItem.textContent?.trim() ?? "";
    expect(initialText.length).toBeGreaterThan(0);

    if (secondarySidebar.isOpen) {
      await userEvent.click(outlineToggle);
      await secondarySidebar.updateComplete;
      await nextFrame();
      expect(secondarySidebar.isOpen).toBe(false);
    }

    await userEvent.click(outlineToggle);
    await secondarySidebar.updateComplete;
    await nextFrame();
    const reopenedWide = secondarySidebar.querySelector<HTMLElement>(
      "[data-docs-outline] a, [data-docs-outline] li, [data-docs-outline] span",
    );
    expect(reopenedWide?.textContent?.trim()).toBe(initialText);

    layout.style.setProperty(
      "--uik-component-shell-collapse-breakpoint",
      "40rem",
    );
    layout.style.width = "22rem";
    await waitForNarrowLayout(layout);
    expect(layout.hasAttribute("data-shell-narrow")).toBe(true);

    await userEvent.click(outlineToggle);
    await secondarySidebar.updateComplete;
    await nextFrame();
    if (!secondarySidebar.isOpen) {
      await userEvent.click(outlineToggle);
      await secondarySidebar.updateComplete;
      await nextFrame();
    }

    const mainRegion = layout.querySelector<HTMLElement>(
      '[data-region="main-content"]',
    );
    if (!mainRegion) throw new Error("Main region not found.");
    const mainWidth = mainRegion.getBoundingClientRect().width;
    expect(mainWidth).toBeGreaterThan(12);

    const reopenedNarrow = secondarySidebar.querySelector<HTMLElement>(
      "[data-docs-outline] a, [data-docs-outline] li, [data-docs-outline] span",
    );
    expect(reopenedNarrow?.textContent?.trim()).toBe(initialText);
  });
});
