import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikShellLayout } from "../index";
import "../index";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const setupLayout = async () => {
  const layout = document.createElement("uik-shell-layout") as UikShellLayout;
  layout.style.width = "360px";
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
    <main slot="main-content">
      <button type="button" data-opener>Open</button>
    </main>
  `;
  document.body.append(layout);
  await layout.updateComplete;
  await nextFrame();
  await nextFrame();
  return layout;
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
});
