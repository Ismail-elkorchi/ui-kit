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

const resetPreferences = () => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage reset failures.
  }
  document.documentElement.removeAttribute("data-uik-theme");
  document.documentElement.removeAttribute("data-uik-density");
};

describe("docs theme and density preferences", () => {
  beforeEach(() => {
    resetPreferences();
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState({}, "", "/");
    const root = document.getElementById("app");
    if (!root) throw new Error("Docs root not found.");
    mountDocsApp(root);
  });

  it("applies defaults, updates attributes, and restores persisted values", async () => {
    const root = document.documentElement;
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const expectedTheme = prefersDark ? "dark" : "light";

    const { themeSelect, densitySelect } = await waitForControls();
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
    const parsed = stored ? JSON.parse(stored) : {};
    expect(parsed.theme).toBe(nextTheme);
    expect(parsed.density).toBe("compact");

    document.body.innerHTML = '<div id="app"></div>';
    root.removeAttribute("data-uik-theme");
    root.removeAttribute("data-uik-density");

    const rootEl = document.getElementById("app");
    if (!rootEl) throw new Error("Docs root not found.");
    mountDocsApp(rootEl);

    await waitForControls();
    expect(root.getAttribute("data-uik-theme")).toBe(nextTheme);
    expect(root.getAttribute("data-uik-density")).toBe("compact");
  });
});
