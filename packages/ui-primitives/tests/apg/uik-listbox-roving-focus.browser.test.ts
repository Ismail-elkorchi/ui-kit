import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import "../../index";
import { pressKey } from "./keyboard";
import { expectRovingTabIndex } from "./roving-focus";
import type { UikListbox, UikOption } from "../../index";

const setupListbox = (): UikListbox => {
  const listbox = document.createElement("uik-listbox");
  listbox.innerHTML = `
    <uik-option value="one">One</uik-option>
    <uik-option value="two">Two</uik-option>
    <uik-option value="three">Three</uik-option>
  `;
  document.body.append(listbox);
  return listbox;
};

const getOptions = (listbox: UikListbox) =>
  Array.from(listbox.querySelectorAll<UikOption>("uik-option"));

describe("APG: uik-listbox roving focus", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("moves focus with Arrow/Home/End keys", async () => {
    const listbox = setupListbox();
    await listbox.updateComplete;

    let options = getOptions(listbox);
    expectRovingTabIndex(options, 0);

    options[0]?.focus();
    await pressKey("ArrowDown");
    await listbox.updateComplete;

    options = getOptions(listbox);
    expect(document.activeElement).toBe(options[1]);
    expectRovingTabIndex(options, 1);

    await pressKey("End");
    await listbox.updateComplete;
    options = getOptions(listbox);
    expect(document.activeElement).toBe(options[2]);

    await pressKey("Home");
    await listbox.updateComplete;
    options = getOptions(listbox);
    expect(document.activeElement).toBe(options[0]);
  });

  it("selects the focused option with Enter", async () => {
    const listbox = setupListbox();
    await listbox.updateComplete;

    const options = getOptions(listbox);
    let selected = "";
    listbox.addEventListener("listbox-select", (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    options[1]?.focus();
    await pressKey("Enter");

    expect(selected).toBe("two");
  });
});
