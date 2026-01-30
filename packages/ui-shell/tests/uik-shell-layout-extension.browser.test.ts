import "@ismail-elkorchi/ui-tokens/index.css";
import "@ismail-elkorchi/ui-primitives/uik-tree-view";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikShellLayout } from "../index";
import "../index";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const setupLayout = async (width = 720) => {
  const layout = document.createElement("uik-shell-layout") as UikShellLayout;
  layout.style.width = `${width.toString()}px`;
  layout.style.height = "400px";
  layout.style.setProperty(
    "--uik-component-shell-collapse-breakpoint",
    "480px",
  );
  layout.style.setProperty("--uik-component-shell-activity-bar-width", "48px");
  layout.style.setProperty("--uik-component-shell-sidebar-width", "160px");
  layout.innerHTML = `
    <uik-shell-activity-bar
      slot="activity-bar"
      data-shell-active-target="view"></uik-shell-activity-bar>
    <uik-shell-sidebar slot="primary-sidebar">
      <button type="button" data-drawer-button>Nav</button>
      <uik-tree-view data-shell-active-target="route"></uik-tree-view>
    </uik-shell-sidebar>
    <main slot="main-content">
      <button type="button" data-opener>Open</button>
    </main>
    <uik-shell-status-bar slot="status-bar">
      <button type="button" slot="context-actions" data-test="context">
        Context
      </button>
      <button type="button" slot="global-controls" data-test="controls">
        Controls
      </button>
    </uik-shell-status-bar>
  `;
  document.body.append(layout);
  await layout.updateComplete;
  await nextFrame();
  await nextFrame();
  return layout;
};

const setLayoutWidth = async (layout: UikShellLayout, width: number) => {
  layout.style.width = `${width.toString()}px`;
  await nextFrame();
  await nextFrame();
};

describe("uik-shell layout extension points", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-uik-motion");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  it("renders status bar slot content in wide and narrow layouts", async () => {
    const layout = await setupLayout(720);
    const statusBar = layout.querySelector("uik-shell-status-bar");
    if (!statusBar) throw new Error("Expected status bar.");

    expect(
      statusBar.querySelector(
        '[data-shell-slot="context-actions"] [data-test="context"]',
      ),
    ).toBeTruthy();
    expect(
      statusBar.querySelector(
        '[data-shell-slot="global-controls"] [data-test="controls"]',
      ),
    ).toBeTruthy();

    await setLayoutWidth(layout, 360);
    expect(layout.hasAttribute("data-shell-narrow")).toBe(true);
    expect(
      statusBar.querySelector(
        '[data-shell-slot="context-actions"] [data-test="context"]',
      ),
    ).toBeTruthy();
    expect(
      statusBar.querySelector(
        '[data-shell-slot="global-controls"] [data-test="controls"]',
      ),
    ).toBeTruthy();
  });

  it("syncs activeRouteKey to view and route targets", async () => {
    const layout = await setupLayout(720);
    const activityBar = layout.querySelector("uik-shell-activity-bar");
    const treeView = layout.querySelector("uik-tree-view");
    if (!activityBar || !treeView) {
      throw new Error("Expected activity bar and tree view.");
    }

    layout.activeRouteKey = "docs/tokens#intro";
    await layout.updateComplete;
    await nextFrame();

    expect((activityBar as { activeId?: string }).activeId).toBe("docs");
    expect((treeView as { currentId?: string }).currentId).toBe(
      "docs/tokens#intro",
    );
  });

  it("restores focus after closing the drawer", async () => {
    const layout = await setupLayout(360);
    const opener = layout.querySelector<HTMLButtonElement>("[data-opener]");
    const drawerButton = layout.querySelector<HTMLButtonElement>(
      "[data-drawer-button]",
    );
    if (!opener || !drawerButton) {
      throw new Error("Expected opener and drawer button.");
    }

    opener.focus();
    layout.isPrimarySidebarOpen = true;
    await layout.updateComplete;
    await nextFrame();

    drawerButton.focus();
    await userEvent.keyboard("{Escape}");
    await layout.updateComplete;

    expect(layout.isPrimarySidebarOpen).toBe(false);
    expect(document.activeElement).toBe(opener);
  });
});
