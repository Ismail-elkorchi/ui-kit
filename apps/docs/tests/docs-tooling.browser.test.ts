import type { UikTreeView } from "@ismail-elkorchi/ui-primitives";
import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";

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
      navTree?.shadowRoot?.querySelector<HTMLElement>("[role=\"treeitem\"]");
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

const getMetaContent = (selector: string) => {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  return element?.content ?? "";
};

describe("docs tooling", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("exposes tooling docs with copyable blocks and metadata", async () => {
    window.history.replaceState({}, "", "/docs/tooling");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
    await waitForContent();

    await customElements.whenDefined("uik-tree-view");
    const navTree = document.querySelector<UikTreeView>("[data-docs-nav-tree]");
    await navTree?.updateComplete;
    await waitForNavItems(navTree);

    const navIds = flattenNavIds((navTree?.items ?? []) as NavItem[]);
    expect(navIds).toContain("docs/tooling");

    const codeBlock = document.querySelector(
      "uik-code-block[copyable]",
    ) as HTMLElement | null;
    expect(codeBlock).toBeTruthy();

    expect(document.title).toBe("UI Kit — Tooling");
    expect(getMetaContent('meta[name="description"]')).toBe(
      "Run gates, generate contracts, refresh docs content, and prepare releases with the UIK CLI.",
    );
    expect(getMetaContent('meta[name="robots"]')).toBe("index,follow");
  });
});
