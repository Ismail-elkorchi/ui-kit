import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikMenu } from "../src/composed/collection/uik-menu";
import "../src/atomic/control/uik-button";
import "../src/composed/collection/uik-menu";
import "../src/composed/collection/uik-menubar";

describe("uik-menubar", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("moves focus across triggers and opens the focused menu", async () => {
    const menubar = document.createElement("uik-menubar");
    menubar.innerHTML = `
      <uik-menu>
        <uik-button slot="trigger" variant="ghost">File</uik-button>
        <uik-menu-item value="new">New</uik-menu-item>
      </uik-menu>
      <uik-menu>
        <uik-button slot="trigger" variant="ghost">Edit</uik-button>
        <uik-menu-item value="undo">Undo</uik-menu-item>
      </uik-menu>
    `;
    document.body.append(menubar);

    const triggers = menubar.querySelectorAll<HTMLElement>("uik-button");
    const menus = menubar.querySelectorAll<UikMenu>("uik-menu");
    if (!triggers[0] || !triggers[1]) {
      throw new Error("Expected menubar triggers.");
    }
    if (!menus[1]) throw new Error("Expected second menu.");

    const withUpdate = menubar as HTMLElement & {
      updateComplete?: Promise<unknown>;
    };
    if (withUpdate.updateComplete) {
      await withUpdate.updateComplete;
    }

    triggers[0].focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(triggers[1]);

    await userEvent.keyboard("{ArrowDown}");
    await menus[1].updateComplete;

    const menuItems = menus[1].querySelectorAll("uik-menu-item");
    expect(menus[1].open).toBe(true);
    expect(document.activeElement).toBe(menuItems[0]);
  });
});
