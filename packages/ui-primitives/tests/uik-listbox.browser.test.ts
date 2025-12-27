import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikListbox } from "../src/composed/collection/uik-listbox";
import type { UikOption } from "../src/composed/collection/uik-listbox/uik-option";
import "../src/composed/collection/uik-listbox";

const getOptions = (listbox: UikListbox) =>
  Array.from(listbox.querySelectorAll<UikOption>("uik-option"));

describe("uik-listbox", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("selects options and emits listbox-select", async () => {
    const listbox = document.createElement("uik-listbox");
    listbox.innerHTML = `
      <uik-option value="one">One</uik-option>
      <uik-option value="two">Two</uik-option>
    `;
    document.body.append(listbox);

    await listbox.updateComplete;

    let selected = "";
    listbox.addEventListener("listbox-select", (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    const options = getOptions(listbox);
    const [firstOption] = options;
    if (!firstOption) throw new Error("Expected listbox options.");
    await userEvent.click(firstOption);

    expect(listbox.value).toBe("one");
    expect(selected).toBe("one");
  });

  it("supports multiple selection", async () => {
    const listbox = document.createElement("uik-listbox");
    listbox.selectionMode = "multiple";
    listbox.innerHTML = `
      <uik-option value="one">One</uik-option>
      <uik-option value="two">Two</uik-option>
      <uik-option value="three">Three</uik-option>
    `;
    document.body.append(listbox);

    await listbox.updateComplete;

    const options = getOptions(listbox);
    const [firstOption, , thirdOption] = options;
    if (!firstOption || !thirdOption) {
      throw new Error("Expected listbox options.");
    }
    await userEvent.click(firstOption);
    await userEvent.click(thirdOption);

    expect(listbox.selectedValues).toEqual(["one", "three"]);

    await userEvent.click(firstOption);

    expect(listbox.selectedValues).toEqual(["three"]);
  });

  it("updates activeId without moving focus in activedescendant mode", async () => {
    const listbox = document.createElement("uik-listbox");
    listbox.focusMode = "activedescendant";
    listbox.innerHTML = `
      <uik-option value="one">One</uik-option>
      <uik-option value="two">Two</uik-option>
    `;
    document.body.append(listbox);

    await listbox.updateComplete;

    listbox.moveActiveByKey("ArrowDown");
    await listbox.updateComplete;

    expect(listbox.activeId).toBe(getOptions(listbox)[1]?.id ?? "");
  });
});
