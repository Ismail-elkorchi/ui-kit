import type { UikButton } from "@ismail-elkorchi/ui-primitives";
import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import "../../index";
import { pressKey } from "./keyboard";
import { expectRovingTabIndex, getShadowActiveElement } from "./roving-focus";
import type { UikNavRail } from "../../index";

const items = [
  {
    id: "explorer",
    label: "Explorer",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    id: "search",
    label: "Search",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "M10 4h4l1 3 3 1v4l-3 1-1 3h-4l-1-3-3-1V8l3-1 1-3z",
  },
] as const;

const getButtons = (rail: UikNavRail) =>
  Array.from(rail.shadowRoot?.querySelectorAll<UikButton>("uik-button") ?? []);

describe("APG: uik-nav-rail roving focus", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("moves focus with arrow/home/end keys", async () => {
    const rail = document.createElement("uik-nav-rail");
    rail.items = [...items];
    rail.activeId = "explorer";
    document.body.append(rail);

    await rail.updateComplete;

    let buttons = getButtons(rail);
    expectRovingTabIndex(buttons, 0);

    buttons[0]?.focus();
    await pressKey("ArrowDown");
    await rail.updateComplete;

    buttons = getButtons(rail);
    expect(getShadowActiveElement(rail.shadowRoot)).toBe(buttons[1]);
    expectRovingTabIndex(buttons, 1);

    await pressKey("End");
    await rail.updateComplete;
    buttons = getButtons(rail);
    expect(getShadowActiveElement(rail.shadowRoot)).toBe(buttons[2]);
    expectRovingTabIndex(buttons, 2);

    await pressKey("Home");
    await rail.updateComplete;
    buttons = getButtons(rail);
    expect(getShadowActiveElement(rail.shadowRoot)).toBe(buttons[0]);
    expectRovingTabIndex(buttons, 0);
  });

  it("activates the focused item with Enter", async () => {
    const rail = document.createElement("uik-nav-rail");
    rail.items = [...items];
    document.body.append(rail);

    await rail.updateComplete;

    const buttons = getButtons(rail);
    let selected = "";
    rail.addEventListener("nav-rail-select", (event) => {
      selected = (event as CustomEvent<{ id: string }>).detail.id;
    });

    buttons[1]?.focus();
    await pressKey("Enter");

    expect(selected).toBe("search");
  });
});
