import type { UikTreeView } from "@ismail-elkorchi/ui-primitives";
import type { UikShellLayout } from "@ismail-elkorchi/ui-shell";
import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mountDocsApp } from "../app";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForContent = async (attempts = 60) => {
  for (let i = 0; i < attempts; i += 1) {
    const content = document.querySelector<HTMLElement>("[data-docs-content]");
    const isReady =
      content?.getAttribute("aria-busy") === "false" &&
      content.innerHTML.trim();
    if (isReady) return;
    await nextFrame();
  }
  throw new Error("Docs content did not render.");
};

describe("docs navigation", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
  });

  it("navigates to the tokens page via keyboard", async () => {
    await customElements.whenDefined("uik-tree-view");
    const layout = document.querySelector<UikShellLayout>("uik-shell-layout");
    if (layout?.hasAttribute("data-shell-narrow")) {
      layout.isPrimarySidebarOpen = true;
      await layout.updateComplete;
      await nextFrame();
    }
    const navTree = document.querySelector<UikTreeView>("[data-docs-nav-tree]");
    await navTree?.updateComplete;
    await waitForContent();

    const firstItem =
      navTree?.shadowRoot?.querySelector<HTMLElement>('[role="treeitem"]');
    expect(firstItem).toBeTruthy();
    firstItem?.focus();
    await userEvent.keyboard("t");

    const active = navTree?.shadowRoot?.activeElement as HTMLElement | null;
    expect(active?.getAttribute("data-item-id")).toBe("docs/tokens");

    await userEvent.keyboard("{Enter}");
    await nextFrame();
    await waitForContent();

    const title = document.querySelector("[data-docs-title]");
    expect(title?.textContent).toContain("Tokens");
  });
});
