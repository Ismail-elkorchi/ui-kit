import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikInput } from "../src/atomic/control/uik-input";
import type { UikSelect } from "../src/atomic/control/uik-select";
import "../src/atomic/control/uik-input";
import "../src/atomic/control/uik-select";
import "../src/composed/collection/uik-listbox/uik-combobox";

describe("control heights", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("aligns input, select, and combobox heights by default", async () => {
    const input = document.createElement("uik-input") as UikInput;
    input.setAttribute("aria-label", "Input");

    const select = document.createElement("uik-select") as UikSelect;
    select.setAttribute("aria-label", "Select");
    select.innerHTML = `
      <option value="alpha">Alpha</option>
      <option value="beta">Beta</option>
    `;

    const combobox = document.createElement("uik-combobox");
    combobox.setAttribute("aria-label", "Combobox");
    combobox.items = [
      { id: "alpha", label: "Alpha" },
      { id: "beta", label: "Beta" },
    ];

    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gap = "var(--uik-space-2)";
    wrapper.append(input, select, combobox);
    document.body.append(wrapper);

    await input.updateComplete;
    await select.updateComplete;
    await combobox.updateComplete;

    const inputControl = input.shadowRoot?.querySelector("input");
    const selectControl = select.shadowRoot?.querySelector("select");
    const comboboxControl = combobox.shadowRoot?.querySelector("input");

    if (!inputControl || !selectControl || !comboboxControl) {
      throw new Error("Expected internal controls to exist.");
    }

    const inputHeight = Math.round(inputControl.getBoundingClientRect().height);
    const selectHeight = Math.round(
      selectControl.getBoundingClientRect().height,
    );
    const comboboxHeight = Math.round(
      comboboxControl.getBoundingClientRect().height,
    );

    expect(selectHeight).toBe(inputHeight);
    expect(comboboxHeight).toBe(inputHeight);
  });
});
