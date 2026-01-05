import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikNav } from "../src/composed/collection/uik-nav";
import type { UikTreeView } from "../src/composed/collection/uik-tree-view";
import "../src/composed/collection/uik-tree-view";
import "../src/composed/collection/uik-nav";

const navItems = [
  {
    id: "docs",
    label: "Docs",
    children: [
      { id: "docs/tokens", label: "Tokens", href: "#docs/tokens" },
      { id: "docs/primitives", label: "Primitives", href: "#docs/primitives" },
    ],
  },
  {
    id: "lab",
    label: "Lab",
    children: [
      { id: "lab/overlays", label: "Overlays", href: "#lab/overlays" },
    ],
  },
];

const treeItems = [
  {
    id: "apps",
    label: "apps",
    children: [
      { id: "apps/main.ts", label: "main.ts" },
      { id: "apps/routes.ts", label: "routes.ts" },
    ],
  },
  {
    id: "packages",
    label: "packages",
    children: [
      { id: "packages/ui-primitives", label: "ui-primitives" },
      { id: "packages/ui-shell", label: "ui-shell" },
    ],
  },
];

describe("uik-nav", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("marks the current link and emits selection events", async () => {
    const nav = document.createElement("uik-nav") as UikNav;
    nav.items = navItems;
    nav.openIds = ["docs", "lab"];
    nav.currentId = "docs/tokens";
    document.body.append(nav);

    await nav.updateComplete;

    const currentLink = nav.shadowRoot?.querySelector('a[aria-current="page"]');
    expect(currentLink?.textContent).toContain("Tokens");

    let detailId = "";
    nav.addEventListener("nav-select", (event) => {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      detailId = detail.id;
      event.preventDefault();
    });

    const link = nav.shadowRoot?.querySelector<HTMLAnchorElement>(
      'a[href="#docs/primitives"]',
    );
    if (!link) throw new Error("Expected nav link.");
    await userEvent.click(link);

    expect(detailId).toBe("docs/primitives");
  });
});

describe("uik-tree-view", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("supports navigation tree keyboard behavior and activation", async () => {
    const tree = document.createElement("uik-tree-view") as UikTreeView;
    tree.items = treeItems;
    tree.openIds = ["apps"];
    tree.currentId = "apps/main.ts";
    document.body.append(tree);

    await tree.updateComplete;

    const currentRow = tree.shadowRoot?.querySelector<HTMLElement>(
      '[data-item-id="apps/main.ts"]',
    );
    expect(currentRow?.getAttribute("aria-current")).toBe("page");

    let activatedId = "";
    tree.addEventListener("tree-view-activate", (event) => {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      activatedId = detail.id;
    });

    const parentRow = tree.shadowRoot?.querySelector<HTMLElement>(
      '[data-item-id="apps"]',
    );
    parentRow?.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(tree.openIds.includes("apps")).toBe(false);

    await userEvent.keyboard("p");
    const typeaheadTarget = tree.shadowRoot?.activeElement as HTMLElement | null;
    expect(typeaheadTarget?.getAttribute("data-item-id")).toBe("packages");

    await userEvent.keyboard("{ArrowRight}{ArrowDown}{Enter}");
    expect(activatedId).toBe("packages/ui-primitives");

    const active = tree.shadowRoot?.activeElement as HTMLElement | null;
    expect(active?.getAttribute("data-item-id")).toBe("packages/ui-primitives");
  });
});
