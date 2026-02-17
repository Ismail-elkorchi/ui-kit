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
    const itemCount = Array.isArray(navTree?.items) ? navTree.items.length : 0;
    const hasRenderedItem =
      navTree?.shadowRoot?.querySelector<HTMLElement>('[role="treeitem"]') !==
      null;
    const hasItems = itemCount > 0 || hasRenderedItem;
    if (hasItems) return;
    await nextFrame();
  }
  throw new Error("Docs navigation tree did not render.");
};

interface NavItem {
  id: string;
  children: NavItem[];
}

const readNavItems = (value: unknown): NavItem[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): NavItem[] => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.id !== "string") return [];
    return [{ id: record.id, children: readNavItems(record.children) }];
  });
};

const flattenNavIds = (items: NavItem[]): string[] => {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.id);
    ids.push(...flattenNavIds(item.children));
  }
  return ids;
};

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

    const navIds = flattenNavIds(readNavItems(navTree?.items));
    expect(navIds).not.toContain("lab/perf-shell");
    expect(navIds).not.toContain("lab/perf-primitives");
    expect(navIds).not.toContain("lab/markdown-rendering");
    expect(navIds).not.toContain("docs/components/uik-alert");
  });

  it("restores hero and preference controls after booting on an internal route", async () => {
    window.history.replaceState({}, "", "/lab/perf-shell");
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    const hero = document.querySelector<HTMLElement>(".docs-hero");
    const headerControls = document.querySelector<HTMLElement>(
      ".docs-header-controls",
    );
    expect(hero?.hasAttribute("hidden")).toBe(true);
    expect(headerControls?.hasAttribute("hidden")).toBe(true);

    window.history.pushState({}, "", "/docs/getting-started");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitForContent();

    expect(hero?.hasAttribute("hidden")).toBe(false);
    expect(headerControls?.hasAttribute("hidden")).toBe(false);
  });
});
