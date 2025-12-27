import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import "../../index";
import { pressKey } from "./keyboard";

const items = [
  { id: "alpha", label: "Alpha" },
  { id: "bravo", label: "Bravo" },
  { id: "charlie", label: "Charlie" },
];

describe("APG: uik-combobox aria-activedescendant", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("updates aria-activedescendant as options change", async () => {
    const combobox = document.createElement("uik-combobox");
    combobox.items = items;
    document.body.append(combobox);

    await combobox.updateComplete;

    const input = combobox.shadowRoot?.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("Expected combobox input.");

    input.focus();
    await combobox.updateComplete;
    expect(input.getAttribute("aria-activedescendant")).toBe("alpha");

    await pressKey("ArrowDown");
    await combobox.updateComplete;
    expect(input.getAttribute("aria-activedescendant")).toBe("bravo");

    await pressKey("ArrowDown");
    await combobox.updateComplete;
    expect(input.getAttribute("aria-activedescendant")).toBe("charlie");
  });
});
