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
  const header = document.querySelector<HTMLElement>(".docs-header");
  return {
    controlSizeMd: rootStyle.getPropertyValue("--uik-size-control-md").trim(),
    layoutControlGap3: rootStyle
      .getPropertyValue("--uik-layout-control-gap-3")
      .trim(),
    headingLineHeight1: rootStyle
      .getPropertyValue("--uik-component-heading-line-height-1")
      .trim(),
    themeControlBlockSize: themeControl
      ? getComputedStyle(themeControl).blockSize
      : "",
    headerBlockSize: header ? getComputedStyle(header).blockSize : "",
  };
};

const readThemeMetrics = () => {
  const rootStyle = getComputedStyle(document.documentElement);
  return {
    surfaceBgVar: rootStyle.getPropertyValue("--uik-surface-bg").trim(),
    colorScheme: rootStyle.colorScheme,
  };
};

const setSelectValue = (element: HTMLElement, value: string) => {
  (element as HTMLInputElement).value = value;
  element.dispatchEvent(new Event("change", { bubbles: true }));
};

const waitForStyleChange = async () => {
  await nextFrame();
  await nextFrame();
  await nextFrame();
};

const getPreferenceMetaText = () =>
  document
    .querySelector<HTMLElement>("[data-docs-preference-meta]")
    ?.textContent.trim();

const getControlContainer = (element: HTMLElement) =>
  element.closest(".docs-header-controls");

const getCurrentPageText = () =>
  document.querySelector<HTMLElement>("[data-docs-current-page]")?.textContent;

const getSearchButton = () =>
  document.querySelector<HTMLElement>(
    '[data-docs-action="command-palette-open"]',
  );

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
    expect(getControlContainer(themeSelect)).toBeTruthy();
    expect(getControlContainer(densitySelect)).toBeTruthy();
    expect(getCurrentPageText()).toBeTruthy();
    expect(getSearchButton()).toBeTruthy();
    expect(
      document.querySelector('uik-shell-layout > [slot="activity-bar"]'),
    ).toBeNull();
    expect(root.getAttribute("data-uik-theme")).toBe(expectedTheme);
    expect(root.getAttribute("data-uik-density")).toBe("comfortable");
    expect(getPreferenceMetaText()).toContain(`Theme: ${expectedTheme}`);
    expect(getPreferenceMetaText()).toContain("Density: comfortable");

    const nextTheme = expectedTheme === "dark" ? "light" : "dark";
    const beforeTheme = readThemeMetrics();
    setSelectValue(themeSelect, nextTheme);
    await waitForStyleChange();
    const afterTheme = readThemeMetrics();

    setSelectValue(densitySelect, "compact");
    await waitForStyleChange();

    expect(root.getAttribute("data-uik-theme")).toBe(nextTheme);
    expect(root.getAttribute("data-uik-density")).toBe("compact");
    expect(afterTheme.surfaceBgVar).not.toBe(beforeTheme.surfaceBgVar);
    expect(afterTheme.colorScheme).not.toBe(beforeTheme.colorScheme);
    expect(getPreferenceMetaText()).toContain(`Theme: ${nextTheme}`);
    expect(getPreferenceMetaText()).toContain("Density: compact");

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
    await waitForStyleChange();
    const before = readDensityMetrics();
    expect(before.controlSizeMd).toBe("2.5rem");
    expect(before.layoutControlGap3).toBe("0.75rem");
    expect(before.headingLineHeight1).toBe("2.25");
    expect(before.themeControlBlockSize).toBeTruthy();
    expect(before.headerBlockSize).toBeTruthy();

    setSelectValue(densitySelect, "compact");
    await waitForStyleChange();
    const compact = readDensityMetrics();

    expect(compact.controlSizeMd).toBe("2.25rem");
    expect(compact.layoutControlGap3).toBe("0.5rem");
    expect(compact.headingLineHeight1).toBe("2");
    expect(compact.themeControlBlockSize).not.toBe(
      before.themeControlBlockSize,
    );
    expect(compact.headerBlockSize).not.toBe(before.headerBlockSize);

    setSelectValue(densitySelect, "comfortable");
    await waitForStyleChange();
    const comfortable = readDensityMetrics();

    expect(comfortable.controlSizeMd).toBe("2.5rem");
    expect(comfortable.layoutControlGap3).toBe("0.75rem");
    expect(comfortable.headingLineHeight1).toBe("2.25");
    expect(comfortable.themeControlBlockSize).toBe(
      before.themeControlBlockSize,
    );
    expect(comfortable.headerBlockSize).toBe(before.headerBlockSize);
  });
});
