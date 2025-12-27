import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "../src/composed/collection/uik-listbox/uik-combobox";

const items = [
  { id: "alpha", label: "Alpha" },
  { id: "bravo", label: "Bravo" },
];

describe("uik-combobox", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("selects options and emits combobox-select", async () => {
    const combobox = document.createElement("uik-combobox");
    combobox.items = items;
    document.body.append(combobox);

    await combobox.updateComplete;

    let selected = "";
    combobox.addEventListener("combobox-select", (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    const input = combobox.shadowRoot?.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("Expected combobox input.");

    input.focus();
    await combobox.updateComplete;
    await userEvent.keyboard("{Enter}");

    expect(combobox.value).toBe("alpha");
    expect(selected).toBe("alpha");
  });

  it("closes on outside click", async () => {
    const combobox = document.createElement("uik-combobox");
    combobox.items = items;
    document.body.append(combobox);

    await combobox.updateComplete;

    combobox.open = true;
    await combobox.updateComplete;

    document.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        bubbles: true,
        composed: true,
      }),
    );
    await combobox.updateComplete;

    expect(combobox.open).toBe(false);
  });
});
