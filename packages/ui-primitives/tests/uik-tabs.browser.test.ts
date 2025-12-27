import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikTabs } from "../src/composed/collection/uik-tabs";
import "../src/composed/collection/uik-tabs";

const setupTabs = (): UikTabs => {
  const tabs = document.createElement("uik-tabs");
  tabs.innerHTML = `
    <uik-tab value="overview">Overview</uik-tab>
    <uik-tab value="activity">Activity</uik-tab>
    <uik-tab-panel value="overview">Overview panel</uik-tab-panel>
    <uik-tab-panel value="activity">Activity panel</uik-tab-panel>
  `;
  document.body.append(tabs);
  return tabs;
};

describe("uik-tabs", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs panel visibility to activeId", async () => {
    const tabs = setupTabs();
    tabs.activeId = "activity";
    await tabs.updateComplete;

    const panels = Array.from(
      tabs.querySelectorAll<HTMLElement>("uik-tab-panel"),
    );
    const overviewPanel = panels.find(
      (panel) => panel.getAttribute("value") === "overview",
    );
    const activityPanel = panels.find(
      (panel) => panel.getAttribute("value") === "activity",
    );

    expect(overviewPanel?.hasAttribute("hidden")).toBe(true);
    expect(activityPanel?.hasAttribute("hidden")).toBe(false);
  });

  it("wires aria-controls and aria-labelledby for tab/panel pairs", async () => {
    const tabs = setupTabs();
    await tabs.updateComplete;

    const tab = tabs.querySelector<HTMLElement>('uik-tab[value="overview"]');
    const panel = tabs.querySelector<HTMLElement>(
      'uik-tab-panel[value="overview"]',
    );
    const controls = tab?.getAttribute("aria-controls");
    const labelledBy = panel?.getAttribute("aria-labelledby");

    expect(controls).toBe(panel?.id);
    expect(labelledBy).toBe(tab?.id);
  });
});
