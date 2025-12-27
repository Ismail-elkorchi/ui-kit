import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import "../../index";
import { pressKey } from "./keyboard";
import { expectRovingTabIndex } from "./roving-focus";
import type { UikTab, UikTabs } from "../../index";

const setupTabs = (): UikTabs => {
  const tabs = document.createElement("uik-tabs");
  tabs.innerHTML = `
    <uik-tab value="overview">Overview</uik-tab>
    <uik-tab value="activity">Activity</uik-tab>
    <uik-tab value="settings">Settings</uik-tab>
    <uik-tab-panel value="overview">Overview panel</uik-tab-panel>
    <uik-tab-panel value="activity">Activity panel</uik-tab-panel>
    <uik-tab-panel value="settings">Settings panel</uik-tab-panel>
  `;
  document.body.append(tabs);
  return tabs;
};

const getTabs = (root: UikTabs) =>
  Array.from(root.querySelectorAll<UikTab>("uik-tab"));

describe("APG: uik-tabs roving focus", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("moves focus with Arrow/Home/End keys", async () => {
    const tabs = setupTabs();
    await tabs.updateComplete;

    let tabItems = getTabs(tabs);
    expectRovingTabIndex(tabItems, 0);

    tabItems[0]?.focus();
    await pressKey("ArrowRight");
    await tabs.updateComplete;

    tabItems = getTabs(tabs);
    expect(document.activeElement).toBe(tabItems[1]);
    expectRovingTabIndex(tabItems, 1);

    await pressKey("End");
    await tabs.updateComplete;
    tabItems = getTabs(tabs);
    expect(document.activeElement).toBe(tabItems[2]);

    await pressKey("Home");
    await tabs.updateComplete;
    tabItems = getTabs(tabs);
    expect(document.activeElement).toBe(tabItems[0]);
  });

  it("activates the focused tab in manual mode", async () => {
    const tabs = setupTabs();
    tabs.activation = "manual";
    await tabs.updateComplete;

    let selected = "";
    tabs.addEventListener("tabs-select", (event) => {
      selected = (event as CustomEvent<{ id: string }>).detail.id;
    });

    const tabItems = getTabs(tabs);
    tabItems[1]?.focus();
    await pressKey("Enter");

    expect(selected).toBe("activity");
  });
});
