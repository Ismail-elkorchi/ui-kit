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

const waitForNavItems = async (navTree: UikTreeView | null, attempts = 60) => {
  for (let i = 0; i < attempts; i += 1) {
    const hasItems =
      (navTree?.items && navTree.items.length > 0) ||
      navTree?.shadowRoot?.querySelector<HTMLElement>('[role="treeitem"]');
    if (hasItems) return;
    await nextFrame();
  }
  throw new Error("Docs navigation tree did not render.");
};

type NavItem = { id: string; label?: string; children?: NavItem[] };
const flattenNavIds = (items: NavItem[] = []) =>
  items.flatMap((item) => [
    item.id,
    ...flattenNavIds((item.children ?? []) as NavItem[]),
  ]);

describe("docs navigation", () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
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
    await waitForNavItems(navTree);
    await waitForContent();

    const firstItem =
      navTree?.shadowRoot?.querySelector<HTMLElement>('[role="treeitem"]');
    expect(firstItem).toBeTruthy();
    firstItem?.focus();
    await userEvent.keyboard("t");

    const active = navTree?.shadowRoot?.activeElement as HTMLElement | null;
    expect(active?.getAttribute("data-item-id")).toBe("docs/tokens-setup");

    await userEvent.keyboard("{Enter}");
    await nextFrame();
    await waitForContent();

    const title = document.querySelector("[data-docs-title]");
    expect(title?.textContent).toContain("Tokens");
    expect(layout?.activeRouteKey).toBe("docs/tokens-setup");
    expect(navTree?.currentId).toBe("docs/tokens-setup");
  });

  it("hides internal fixtures from navigation", async () => {
    await customElements.whenDefined("uik-tree-view");
    const navTree = document.querySelector<UikTreeView>("[data-docs-nav-tree]");
    await navTree?.updateComplete;
    await waitForNavItems(navTree);

    const navIds = flattenNavIds((navTree?.items ?? []) as NavItem[]);
    expect(navIds).not.toContain("lab/perf-shell");
    expect(navIds).not.toContain("lab/perf-primitives");
    expect(navIds).not.toContain("lab/markdown-rendering");
    expect(navIds).not.toContain("docs/components/uik-alert");
  });
});
