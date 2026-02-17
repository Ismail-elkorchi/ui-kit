import "@ismail-elkorchi/ui-tokens/index.css";
import { afterEach, describe, expect, it } from "vitest";

import "../index";

const mockForcedColors = () => {
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
  return () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  };
};

describe("uik-shell forced-colors support", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("applies system colors to shell surfaces in forced-colors mode", async () => {
    const restoreMatchMedia = mockForcedColors();

    const activityBar = document.createElement("uik-shell-activity-bar");
    document.body.append(activityBar);
    await activityBar.updateComplete;

    const activityContainer = activityBar.querySelector<HTMLElement>(
      "[data-region='activity-bar']",
    );
    if (!activityContainer) {
      throw new Error("Expected activity bar region.");
    }

    expect(activityContainer.style.backgroundColor.toLowerCase()).toBe(
      "canvas",
    );
    expect(activityContainer.style.color.toLowerCase()).toBe("canvastext");

    const sidebar = document.createElement("uik-shell-sidebar");
    sidebar.heading = "Navigation";
    document.body.append(sidebar);
    await sidebar.updateComplete;

    const primarySidebar = sidebar.querySelector<HTMLElement>(
      "[data-region='primary-sidebar']",
    );
    if (!primarySidebar) throw new Error("Expected primary sidebar region.");

    expect(primarySidebar.style.backgroundColor.toLowerCase()).toBe("canvas");
    expect(primarySidebar.style.borderRight.toLowerCase()).toContain(
      "canvastext",
    );

    const separator = sidebar.querySelector("uik-separator");
    if (!separator) throw new Error("Expected sidebar separator.");
    expect(separator.getAttribute("style")?.toLowerCase()).toContain(
      "canvastext",
    );

    const secondary = document.createElement("uik-shell-secondary-sidebar");
    secondary.heading = "Details";
    secondary.isOpen = true;
    document.body.append(secondary);
    await secondary.updateComplete;

    const secondarySidebar = secondary.querySelector<HTMLElement>(
      "[data-region='secondary-sidebar']",
    );
    if (!secondarySidebar) {
      throw new Error("Expected secondary sidebar region.");
    }

    expect(secondarySidebar.style.backgroundColor.toLowerCase()).toBe("canvas");
    expect(secondarySidebar.style.borderLeft.toLowerCase()).toContain(
      "canvastext",
    );

    const statusBar = document.createElement("uik-shell-status-bar");
    statusBar.message = "Ready";
    document.body.append(statusBar);
    await statusBar.updateComplete;

    const statusRegion = statusBar.querySelector<HTMLElement>(
      "[data-region='status-bar']",
    );
    if (!statusRegion) throw new Error("Expected status bar region.");

    expect(statusRegion.style.backgroundColor.toLowerCase()).toBe("canvas");
    expect(statusRegion.style.color.toLowerCase()).toBe("canvastext");

    restoreMatchMedia();
  });
});
