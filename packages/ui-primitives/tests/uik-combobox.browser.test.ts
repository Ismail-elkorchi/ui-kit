import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

  it("disconnects outside-dismiss listeners when removed", async () => {
    const originalAdd = document.addEventListener.bind(document);
    let dismissSignal: AbortSignal | null = null;
    const addSpy = vi
      .spyOn(document, "addEventListener")
      .mockImplementation((type, listener, options) => {
        if (type === "pointerdown" && options && typeof options !== "boolean") {
          dismissSignal = options.signal ?? null;
        }
        originalAdd(type, listener, options);
      });

    const combobox = document.createElement("uik-combobox");
    combobox.items = items;
    document.body.append(combobox);

    await combobox.updateComplete;

    combobox.open = true;
    await combobox.updateComplete;

    expect(dismissSignal).not.toBeNull();

    combobox.remove();

    expect(dismissSignal?.aborted).toBe(true);

    addSpy.mockRestore();
  });

  it("falls back to value reflection when ElementInternals are unavailable", async () => {
    const attachSpy =
      typeof HTMLElement.prototype.attachInternals === "function"
        ? vi
            .spyOn(HTMLElement.prototype, "attachInternals")
            .mockImplementation(() => {
              throw new Error("unsupported");
            })
        : null;

    const combobox = document.createElement("uik-combobox");
    combobox.items = items;
    document.body.append(combobox);

    await combobox.updateComplete;

    combobox.value = "alpha";
    await combobox.updateComplete;
    expect(combobox.getAttribute("value")).toBe("alpha");

    let selected = "";
    combobox.addEventListener("combobox-select", (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    combobox.open = true;
    await combobox.updateComplete;

    combobox.shadowRoot?.querySelector("uik-listbox")?.dispatchEvent(
      new CustomEvent("listbox-select", {
        detail: { value: "bravo" },
        bubbles: true,
        composed: true,
      }),
    );

    await combobox.updateComplete;

    expect(combobox.value).toBe("bravo");
    expect(combobox.getAttribute("value")).toBe("bravo");
    expect(selected).toBe("bravo");

    attachSpy?.mockRestore();
  });
});
