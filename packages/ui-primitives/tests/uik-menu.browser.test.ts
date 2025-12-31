import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikMenu } from "../src/composed/collection/uik-menu";
import type { UikMenuItem } from "../src/composed/collection/uik-menu/uik-menu-item";
import "../src/atomic/control/uik-button";
import "../src/composed/collection/uik-menu";

const getItems = (menu: UikMenu) =>
  Array.from(menu.querySelectorAll<UikMenuItem>("uik-menu-item"));

describe("uik-menu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("moves focus with arrow keys and returns focus on Escape", async () => {
    const menu = document.createElement("uik-menu");
    menu.innerHTML = `
      <uik-button slot="trigger" variant="ghost">File</uik-button>
      <uik-menu-item value="new">New</uik-menu-item>
      <uik-menu-item value="open">Open</uik-menu-item>
      <uik-menu-item value="close" disabled>Close</uik-menu-item>
    `;
    document.body.append(menu);

    await menu.updateComplete;

    const trigger = menu.querySelector<HTMLElement>("uik-button");
    if (!trigger) throw new Error("Expected menu trigger.");
    trigger.focus();

    menu.openWithFocus();
    await menu.updateComplete;
    await menu.updateComplete;

    const items = getItems(menu);
    expect(document.activeElement).toBe(items[0]);

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[1]);

    await userEvent.keyboard("{Escape}");
    await menu.updateComplete;

    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});
