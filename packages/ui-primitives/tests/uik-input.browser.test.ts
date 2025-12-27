import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikInput } from "../src/atomic/control/uik-input";
import "../src/atomic/control/uik-input";

describe("uik-input", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("associates label and description slots with the input", async () => {
    const input = document.createElement("uik-input") as UikInput;
    input.innerHTML = `
      <span slot="label">Email</span>
      <span slot="hint">Work email only</span>
      <span slot="error">Required</span>
    `;
    document.body.append(input);

    await input.updateComplete;

    const label = input.shadowRoot?.querySelector("label");
    const control = input.shadowRoot?.querySelector("input");
    const hint = input.shadowRoot?.querySelector('[part="hint"]');
    const error = input.shadowRoot?.querySelector('[part="error"]');

    expect(label).not.toBeNull();
    expect(control).not.toBeNull();
    expect(hint).not.toBeNull();
    expect(error).not.toBeNull();

    expect(label?.htmlFor).toBe(control?.id);
    expect(control?.getAttribute("aria-describedby")).toContain(hint?.id ?? "");
    expect(control?.getAttribute("aria-describedby")).toContain(
      error?.id ?? "",
    );
    expect(control?.getAttribute("aria-invalid")).toBe("true");
  });

  it("forwards aria-label when no label slot is provided", async () => {
    const input = document.createElement("uik-input") as UikInput;
    input.setAttribute("aria-label", "Search");
    document.body.append(input);

    await input.updateComplete;

    const control = input.shadowRoot?.querySelector("input");
    expect(control?.getAttribute("aria-label")).toBe("Search");
  });

  it("keeps value in sync with user input", async () => {
    const input = document.createElement("uik-input") as UikInput;
    document.body.append(input);

    await input.updateComplete;

    const control = input.shadowRoot?.querySelector("input");
    if (!control) throw new Error("Expected internal input.");
    await userEvent.type(control, "hello");

    expect(input.value).toBe("hello");
  });

  it("syncs value on change and form callbacks", async () => {
    const input = document.createElement("uik-input") as UikInput;
    input.value = "start";
    document.body.append(input);

    await input.updateComplete;

    const control = input.shadowRoot?.querySelector("input");
    if (!control) throw new Error("Expected internal input.");

    control.value = "updated";
    control.dispatchEvent(new Event("change", { bubbles: true }));
    await input.updateComplete;
    expect(input.value).toBe("updated");

    input.formStateRestoreCallback("restored");
    expect(input.value).toBe("restored");

    input.formStateRestoreCallback(new FormData());

    input.formResetCallback();
    expect(input.value).toBe("");

    input.formDisabledCallback(true);
    expect(input.disabled).toBe(true);
  });

  it("treats nested label elements as slot content", async () => {
    const input = document.createElement("uik-input") as UikInput;
    input.setAttribute("aria-label", "Search");
    input.setAttribute("aria-labelledby", "external");
    input.innerHTML = '<span slot="label"><strong></strong></span>';
    document.body.append(input);

    await input.updateComplete;

    const label = input.shadowRoot?.querySelector("label");
    const control = input.shadowRoot?.querySelector("input");
    expect(label?.hasAttribute("hidden")).toBe(false);
    expect(control?.getAttribute("aria-label")).toBeNull();
    expect(control?.getAttribute("aria-labelledby")).toBeNull();
  });

  it("marks required inputs as invalid when empty", async () => {
    const form = document.createElement("form");
    const input = document.createElement("uik-input") as UikInput;
    input.name = "email";
    input.required = true;
    form.append(input);
    document.body.append(form);

    await input.updateComplete;
    expect(form.checkValidity()).toBe(false);

    input.value = "hello@uik.dev";
    await input.updateComplete;
    expect(form.checkValidity()).toBe(true);
  });

  it("ignores validity sync when the internal input is missing", async () => {
    const input = document.createElement("uik-input") as UikInput;
    document.body.append(input);

    await input.updateComplete;
    input.shadowRoot?.querySelector("input")?.remove();

    (input as unknown as { syncValidity: () => void }).syncValidity();
    expect(true).toBe(true);
  });

  it("participates in form submission via ElementInternals", async () => {
    const form = document.createElement("form");
    const input = document.createElement("uik-input") as UikInput;
    input.name = "email";
    input.value = "hello@uik.dev";
    form.append(input);
    document.body.append(form);

    await input.updateComplete;

    const data = new FormData(form);
    expect(data.get("email")).toBe("hello@uik.dev");
  });
});
