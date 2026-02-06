import "@ismail-elkorchi/ui-tokens/base.css";
import { beforeEach, describe, expect, it } from "vitest";

import { mountDocsApp } from "../app";

const storageKey = "uik-docs-preferences";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForControls = async (attempts = 60) => {
  for (let i = 0; i < attempts; i += 1) {
    const themeSelect = document.querySelector<HTMLElement>(
      'uik-select[data-docs-control="theme"]',
    );
    const densitySelect = document.querySelector<HTMLElement>(
      'uik-select[data-docs-control="density"]',
    );
    if (themeSelect && densitySelect) return { themeSelect, densitySelect };
    await nextFrame();
  }
  throw new Error("Docs controls did not render.");
};

const readDensityMetrics = () => {
  const rootStyle = getComputedStyle(document.documentElement);
  const themeControl = document.querySelector<HTMLElement>(
    'uik-select[data-docs-control="theme"]',
  );
  const navRail = document.querySelector<HTMLElement>(
    "uik-shell-activity-bar uik-nav-rail",
  );
  const navRailItem = navRail?.shadowRoot?.querySelector<HTMLElement>(".item");
  return {
    controlSizeMd: rootStyle.getPropertyValue("--uik-size-control-md").trim(),
    navRailItemSizeVar: rootStyle
      .getPropertyValue("--uik-component-nav-rail-item-size")
      .trim(),
    themeControlBlockSize: themeControl
      ? getComputedStyle(themeControl).blockSize
      : "",
    navRailItemBlockSize: navRailItem
      ? getComputedStyle(navRailItem).blockSize
      : "",
  };
};

const resetPreferences = () => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage reset failures.
  }
  document.documentElement.removeAttribute("data-uik-theme");
  document.documentElement.removeAttribute("data-uik-density");
};

const parseStoredPreferences = (value: string | null) => {
  if (!value) return { theme: undefined, density: undefined };
  const raw: unknown = JSON.parse(value);
  if (!raw || typeof raw !== "object") {
    return { theme: undefined, density: undefined };
  }
  const record = raw as Record<string, unknown>;
  return {
    theme: typeof record.theme === "string" ? record.theme : undefined,
    density: typeof record.density === "string" ? record.density : undefined,
  };
};

describe("docs theme and density preferences", () => {
  beforeEach(async () => {
    resetPreferences();
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState({}, "", "/");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    await mountDocsApp(root);
  });

  it("applies defaults, updates attributes, and restores persisted values", async () => {
    const root = document.documentElement;
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const expectedTheme = prefersDark ? "dark" : "light";

    const { themeSelect, densitySelect } = await waitForControls();
    const statusBar = document.querySelector("uik-shell-status-bar");
    expect(statusBar).toBeTruthy();
    expect(
      themeSelect.closest('[data-shell-slot="global-controls"]'),
    ).toBeTruthy();
    expect(
      densitySelect.closest('[data-shell-slot="global-controls"]'),
    ).toBeTruthy();
    expect(root.getAttribute("data-uik-theme")).toBe(expectedTheme);
    expect(root.getAttribute("data-uik-density")).toBe("comfortable");

    const nextTheme = expectedTheme === "dark" ? "light" : "dark";
    (themeSelect as HTMLInputElement).value = nextTheme;
    themeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    (densitySelect as HTMLInputElement).value = "compact";
    densitySelect.dispatchEvent(new Event("change", { bubbles: true }));

    expect(root.getAttribute("data-uik-theme")).toBe(nextTheme);
    expect(root.getAttribute("data-uik-density")).toBe("compact");

    const stored = localStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    const parsed = parseStoredPreferences(stored);
    expect(parsed.theme).toBe(nextTheme);
    expect(parsed.density).toBe("compact");

    document.body.innerHTML = '<div id="app"></div>';
    root.removeAttribute("data-uik-theme");
    root.removeAttribute("data-uik-density");

    const rootEl = document.getElementById("app");
    if (!rootEl) throw new Error("Docs root not found.");
    await mountDocsApp(rootEl);

    await waitForControls();
    expect(root.getAttribute("data-uik-theme")).toBe(nextTheme);
    expect(root.getAttribute("data-uik-density")).toBe("compact");
  });

  it("changes deterministic computed values when density toggles", async () => {
    const root = document.documentElement;
    const { densitySelect } = await waitForControls();

    root.setAttribute("data-uik-density", "comfortable");
    await nextFrame();
    await nextFrame();
    const before = readDensityMetrics();
    expect(before.controlSizeMd).toBe("2.5rem");
    expect(before.navRailItemSizeVar).toBe("3rem");

    (densitySelect as HTMLInputElement).value = "compact";
    densitySelect.dispatchEvent(new Event("change", { bubbles: true }));
    await nextFrame();
    await nextFrame();
    const compact = readDensityMetrics();

    expect(compact.controlSizeMd).toBe("2.25rem");
    expect(compact.navRailItemSizeVar).toBe("2.5rem");
    expect(compact.themeControlBlockSize).not.toBe(
      before.themeControlBlockSize,
    );
    expect(compact.navRailItemBlockSize).not.toBe(before.navRailItemBlockSize);

    (densitySelect as HTMLInputElement).value = "comfortable";
    densitySelect.dispatchEvent(new Event("change", { bubbles: true }));
    await nextFrame();
    await nextFrame();
    const comfortable = readDensityMetrics();

    expect(comfortable.controlSizeMd).toBe("2.5rem");
    expect(comfortable.navRailItemSizeVar).toBe("3rem");
    expect(comfortable.themeControlBlockSize).toBe(
      before.themeControlBlockSize,
    );
    expect(comfortable.navRailItemBlockSize).toBe(before.navRailItemBlockSize);
  });
});
