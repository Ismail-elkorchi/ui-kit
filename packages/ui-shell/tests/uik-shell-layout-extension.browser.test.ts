import "@ismail-elkorchi/ui-tokens/index.css";
import "@ismail-elkorchi/ui-primitives/uik-tree-view";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    <header slot="header" data-test="header-shell" aria-label="Docs header">
      <button type="button" data-test="header-action">Menu</button>
    </header>
    <uik-shell-activity-bar
      slot="activity-bar"
      data-shell-active-target="view"></uik-shell-activity-bar>
    <uik-shell-sidebar slot="primary-sidebar">
      <button type="button" data-drawer-button>Nav</button>
      <uik-tree-view data-shell-active-target="route"></uik-tree-view>
    </uik-shell-sidebar>
    <div slot="main-content">
      <button type="button" data-opener>Open</button>
    </div>
    <uik-shell-secondary-sidebar slot="secondary-sidebar" isOpen>
      <div data-test="secondary-content">Outline</div>
    </uik-shell-secondary-sidebar>
    <uik-shell-status-bar slot="status-bar">
      <button type="button" slot="context-actions" data-test="context">
        Context
      </button>
      <button type="button" slot="global-controls" data-test="controls">
        Controls
      </button>
    </uik-shell-status-bar>
  `;
  layout.isSecondarySidebarVisible = true;
  document.body.append(layout);
  await layout.updateComplete;
  await nextFrame();
  await nextFrame();
  return layout;
};

const waitForNarrowState = async (
  layout: UikShellLayout,
  isNarrow: boolean,
  timeoutMs = 1500,
) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (layout.hasAttribute("data-shell-narrow") === isNarrow) return;
    await nextFrame();
  }
  throw new Error(
    `Expected data-shell-narrow=${isNarrow ? "true" : "false"} after resize.`,
  );
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
    await waitForNarrowState(layout, true);
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

  it("renders header slot content in wide and narrow layouts", async () => {
    const layout = await setupLayout(720);
    const headerButton = layout.querySelector<HTMLButtonElement>(
      "[data-test='header-action']",
    );
    if (!headerButton) throw new Error("Expected header action.");

    expect(headerButton.closest("[data-shell-slot='header']")).toBeTruthy();
    expect(
      getComputedStyle(
        layout.querySelector<HTMLElement>('[part=\"header\"]') ?? document.body,
      ).display,
    ).not.toBe("none");

    await setLayoutWidth(layout, 360);
    await waitForNarrowState(layout, true);
    expect(layout.querySelector("[data-test='header-action']")).toBe(
      headerButton,
    );
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

  it("retains secondary sidebar content in wide and narrow layouts", async () => {
    const layout = await setupLayout(720);
    const secondary = layout.querySelector<HTMLElement>(
      "uik-shell-secondary-sidebar",
    ) as
      | (HTMLElement & { isOpen: boolean; updateComplete: Promise<unknown> })
      | null;
    if (!secondary) throw new Error("Expected secondary sidebar.");

    const initialContent = secondary.querySelector(
      "[data-test='secondary-content']",
    );
    expect(initialContent).toBeTruthy();

    const toggleSecondary = async (isOpen: boolean) => {
      secondary.isOpen = isOpen;
      layout.isSecondarySidebarVisible = isOpen;
      await layout.updateComplete;
      await secondary.updateComplete;
      await nextFrame();
    };

    await toggleSecondary(false);
    await toggleSecondary(true);
    expect(secondary.querySelector("[data-test='secondary-content']")).toBe(
      initialContent,
    );

    await setLayoutWidth(layout, 360);
    await waitForNarrowState(layout, true);
    await toggleSecondary(false);
    await toggleSecondary(true);
    expect(secondary.querySelector("[data-test='secondary-content']")).toBe(
      initialContent,
    );
  });

  it("does not treat nested slot attributes in main content as shell regions", async () => {
    const layout = document.createElement("uik-shell-layout") as UikShellLayout;
    layout.style.width = "720px";
    layout.style.height = "400px";
    layout.innerHTML = `
      <uik-shell-sidebar slot="primary-sidebar"></uik-shell-sidebar>
      <div slot="main-content">
        <pre>
          <code>&lt;div slot="activity-bar"&gt;example&lt;/div&gt;</code>
        </pre>
      </div>
    `;
    document.body.append(layout);
    await layout.updateComplete;
    await nextFrame();

    const activityRegion = layout.querySelector<HTMLElement>(
      '[part="activity-bar"]',
    );
    if (!activityRegion) throw new Error("Expected activity region.");
    expect(getComputedStyle(activityRegion).display).toBe("none");
  });

  it("ignores nested subtree mutations inside assigned slots", async () => {
    const layout = await setupLayout(720);
    const requestUpdateSpy = vi.spyOn(layout, "requestUpdate");
    const mainContent = layout.querySelector<HTMLElement>(
      '[data-shell-slot="main-content"] [slot="main-content"]',
    );
    if (!mainContent) throw new Error("Expected main content slot node.");

    await nextFrame();
    await nextFrame();
    requestUpdateSpy.mockClear();

    const nested = document.createElement("div");
    mainContent.append(nested);
    await nextFrame();
    requestUpdateSpy.mockClear();

    for (let index = 0; index < 12; index += 1) {
      const span = document.createElement("span");
      span.textContent = `mutation-${index.toString()}`;
      nested.append(span);
      if (index % 2 === 0) {
        span.remove();
      }
    }
    await nextFrame();
    await nextFrame();

    expect(requestUpdateSpy).not.toHaveBeenCalled();
  });
});
