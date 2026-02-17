import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikShellLayout } from "../index";
import "../index";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const setupLayout = async (width = 360) => {
  const layout = document.createElement("uik-shell-layout");
  layout.style.width = `${width.toString()}px`;
  layout.style.height = "400px";
  layout.style.setProperty(
    "--uik-component-shell-collapse-breakpoint",
    "480px",
  );
  layout.style.setProperty("--uik-component-shell-activity-bar-width", "48px");
  layout.style.setProperty("--uik-component-shell-sidebar-width", "120px");
  layout.innerHTML = `
    <uik-shell-activity-bar slot="activity-bar"></uik-shell-activity-bar>
    <uik-shell-sidebar slot="primary-sidebar">
      <button type="button" data-drawer-button>Nav</button>
    </uik-shell-sidebar>
    <div slot="main-content">
      <button type="button" data-opener>Open</button>
    </div>
  `;
  document.body.append(layout);
  await layout.updateComplete;
  await nextFrame();
  await nextFrame();
  return layout;
};

const setupLayoutWithoutActivity = async (width = 360) => {
  const layout = document.createElement("uik-shell-layout");
  layout.style.width = `${width.toString()}px`;
  layout.style.height = "400px";
  layout.style.setProperty(
    "--uik-component-shell-collapse-breakpoint",
    "480px",
  );
  layout.style.setProperty("--uik-component-shell-sidebar-width", "120px");
  layout.innerHTML = `
    <uik-shell-sidebar slot="primary-sidebar">
      <button type="button" data-drawer-button>Nav</button>
    </uik-shell-sidebar>
    <div slot="main-content">
      <button type="button" data-opener>Open</button>
    </div>
  `;
  document.body.append(layout);
  await layout.updateComplete;
  await nextFrame();
  await nextFrame();
  return layout;
};

const setupLayoutWithSecondary = async (width = 360) => {
  const layout = document.createElement("uik-shell-layout");
  layout.style.width = `${width.toString()}px`;
  layout.style.height = "400px";
  layout.style.setProperty(
    "--uik-component-shell-collapse-breakpoint",
    "480px",
  );
  layout.style.setProperty("--uik-component-shell-sidebar-width", "120px");
  layout.style.setProperty(
    "--uik-component-shell-secondary-sidebar-width",
    "180px",
  );
  layout.innerHTML = `
    <uik-shell-sidebar slot="primary-sidebar">
      <button type="button" data-drawer-button>Nav</button>
    </uik-shell-sidebar>
    <div slot="main-content">
      <button type="button" data-opener>Open</button>
    </div>
    <uik-shell-secondary-sidebar slot="secondary-sidebar">
      <div data-outline-item>Outline item</div>
    </uik-shell-secondary-sidebar>
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

describe("uik-shell-layout drawer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-uik-motion");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  it("closes on Escape and restores focus to the opener", async () => {
    const layout = await setupLayout();
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

  it("collapses drawer content at narrow widths and prevents focus", async () => {
    const layout = await setupLayout(360);
    const drawer = layout.querySelector<HTMLElement>("[data-shell-drawer]");
    const drawerButton = layout.querySelector<HTMLButtonElement>(
      "[data-drawer-button]",
    );
    if (!drawer || !drawerButton) {
      throw new Error("Expected drawer and drawer button.");
    }

    expect(layout.hasAttribute("data-shell-narrow")).toBe(true);
    expect(drawer.hasAttribute("inert")).toBe(true);

    drawerButton.focus();
    expect(document.activeElement).not.toBe(drawerButton);
  });

  it("moves focus to main content when collapsing while focused in the sidebar", async () => {
    const layout = await setupLayout(640);
    const drawerButton = layout.querySelector<HTMLButtonElement>(
      "[data-drawer-button]",
    );
    const opener = layout.querySelector<HTMLButtonElement>("[data-opener]");
    if (!drawerButton || !opener) {
      throw new Error("Expected drawer button and opener.");
    }

    drawerButton.focus();
    expect(document.activeElement).toBe(drawerButton);

    await setLayoutWidth(layout, 360);

    expect(layout.hasAttribute("data-shell-narrow")).toBe(true);
    expect(document.activeElement).toBe(opener);
  });

  it("closes on scrim click and restores scroll", async () => {
    const layout = await setupLayout();
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    layout.isPrimarySidebarOpen = true;
    await layout.updateComplete;
    await nextFrame();

    const scrim = document.querySelector<HTMLElement>("[data-shell-scrim]");
    if (!scrim) throw new Error("Expected scrim element.");

    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.click(scrim);
    await layout.updateComplete;

    expect(layout.isPrimarySidebarOpen).toBe(false);
    expect(document.documentElement.style.overflow).toBe("auto");
    expect(document.body.style.overflow).toBe("auto");
  });

  it("disables drawer transitions when reduced motion is requested", async () => {
    document.documentElement.setAttribute("data-uik-motion", "reduced");
    const layout = await setupLayout();

    layout.isPrimarySidebarOpen = true;
    await layout.updateComplete;
    await nextFrame();

    const drawer = layout.querySelector<HTMLElement>("[data-shell-drawer]");
    if (!drawer) throw new Error("Expected drawer element.");

    expect(drawer.style.transition).toBe("none");
  });

  it("uses forced-colors scrim styling when forced colors are active", async () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => {
        if (query.includes("forced-colors")) {
          return {
            matches: true,
            media: query,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            onchange: null,
            dispatchEvent: () => false,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      },
    });

    const layout = await setupLayout();
    layout.isPrimarySidebarOpen = true;
    await layout.updateComplete;
    await nextFrame();

    const scrim = document.querySelector<HTMLElement>("[data-shell-scrim]");
    if (!scrim) throw new Error("Expected scrim element.");

    expect(scrim.style.backgroundColor.toLowerCase()).toBe("canvastext");
    expect(scrim.style.opacity).toBe("0.25");

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("does not reserve activity or status regions when slots are omitted", async () => {
    const layout = await setupLayoutWithoutActivity(360);
    const drawer = layout.querySelector<HTMLElement>("[data-shell-drawer]");
    const activityRegion = layout.querySelector<HTMLElement>(
      '[part="activity-bar"]',
    );
    const statusRegion = layout.querySelector<HTMLElement>(
      '[part="status-bar"]',
    );
    const mainRegion = layout.querySelector<HTMLElement>(
      '[part="main-content"]',
    );
    if (!drawer || !activityRegion || !statusRegion || !mainRegion) {
      throw new Error("Expected shell regions.");
    }

    expect(getComputedStyle(activityRegion).display).toBe("none");
    expect(getComputedStyle(statusRegion).display).toBe("none");

    layout.isPrimarySidebarOpen = true;
    await layout.updateComplete;
    await nextFrame();

    const drawerWidth = Number.parseFloat(getComputedStyle(drawer).width);
    expect(Math.round(drawerWidth)).toBe(120);
    expect(mainRegion.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it("renders secondary sidebar as overlay in narrow mode without collapsing main content", async () => {
    const layout = await setupLayoutWithSecondary(360);
    const secondary = layout.querySelector<HTMLElement>(
      '[part="secondary-sidebar"]',
    );
    const mainRegion = layout.querySelector<HTMLElement>(
      '[part="main-content"]',
    );
    const sidebar = layout.querySelector<HTMLElement>(
      "uik-shell-secondary-sidebar",
    ) as
      | (HTMLElement & {
          isOpen?: boolean;
          updateComplete?: Promise<unknown>;
        })
      | null;
    if (!secondary || !mainRegion || !sidebar) {
      throw new Error("Expected secondary and main regions.");
    }
    const secondarySidebar = sidebar as {
      isOpen?: boolean;
      updateComplete?: Promise<unknown>;
    };

    layout.isSecondarySidebarVisible = true;
    if ("isOpen" in secondarySidebar) secondarySidebar.isOpen = true;
    await layout.updateComplete;
    if (secondarySidebar.updateComplete) {
      await secondarySidebar.updateComplete;
    }
    await nextFrame();

    expect(layout.hasAttribute("data-shell-narrow")).toBe(true);
    expect(getComputedStyle(secondary).position).toBe("fixed");
    expect(mainRegion.getBoundingClientRect().width).toBeGreaterThan(12);

    layout.isSecondarySidebarVisible = false;
    if ("isOpen" in secondarySidebar) secondarySidebar.isOpen = false;
    await layout.updateComplete;
    if (secondarySidebar.updateComplete) {
      await secondarySidebar.updateComplete;
    }
    await nextFrame();

    layout.isSecondarySidebarVisible = true;
    if ("isOpen" in secondarySidebar) secondarySidebar.isOpen = true;
    await layout.updateComplete;
    if (secondarySidebar.updateComplete) {
      await secondarySidebar.updateComplete;
    }
    await nextFrame();

    const content = layout.querySelector<HTMLElement>("[data-outline-item]");
    expect(content?.textContent).toContain("Outline item");
  });
});
