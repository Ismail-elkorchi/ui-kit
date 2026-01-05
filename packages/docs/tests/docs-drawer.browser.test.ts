import type { UikButton } from "@ismail-elkorchi/ui-primitives";
import type { UikShellSecondarySidebar } from "@ismail-elkorchi/ui-shell";
import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mountDocsApp } from "../app";

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

describe("docs outline drawer focus", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("sets initial focus inside the drawer and restores focus on close", async () => {
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
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
      await userEvent.click(outlineToggle);
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
});
