import { html, render } from "lit";
import { beforeEach, describe, expect, it } from "vitest";

import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-tokens/index.css";

const mount = (template: ReturnType<typeof html>) => {
  const container = document.createElement("div");
  document.body.append(container);
  render(template, container);
  return container;
};

const waitForUpdate = async <T extends Element>(
  selector: string,
): Promise<T> => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing element for selector: ${selector}`);
  }
  const withUpdate = element as T & { updateComplete?: Promise<unknown> };
  if (withUpdate.updateComplete) {
    await withUpdate.updateComplete;
  }
  return element as T;
};

describe("storybook visuals", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.setAttribute("data-uik-theme", "light");
    document.documentElement.setAttribute("data-uik-density", "comfortable");
  });

  it("renders dialog", async () => {
    mount(html`
      <uik-dialog ?open=${true} ?modal=${false}>
        <span slot="title">Invite team</span>
        <span slot="description"
          >Share the link below with your teammates.</span
        >
        <uik-input
          placeholder="team@uik.dev"
          aria-label="Invitee email"
        ></uik-input>
        <uik-stack slot="actions" direction="horizontal" gap="2" justify="end">
          <uik-button variant="secondary">Cancel</uik-button>
          <uik-button>Send invite</uik-button>
        </uik-stack>
      </uik-dialog>
    `);
    const dialog = await waitForUpdate<HTMLElement>("uik-dialog");
    const internal = dialog.shadowRoot?.querySelector("dialog");
    if (!internal) throw new Error("Dialog element missing.");
    await expect.element(internal).toMatchScreenshot();
  }, 30_000);

  it("renders progress", async () => {
    mount(
      html`<uik-progress
        .value=${45}
        .max=${100}
        aria-label="Upload progress"
      ></uik-progress>`,
    );
    const progress = await waitForUpdate<HTMLElement>("uik-progress");
    const bar = progress.shadowRoot?.querySelector("progress");
    if (!bar) throw new Error("Progress element missing.");
    await expect.element(bar).toMatchScreenshot();
  });

  it("renders select", async () => {
    mount(html`
      <uik-select .value=${"beta"}>
        <span slot="label">Plan</span>
        <span slot="hint">Choose your billing tier.</span>
        <option value="alpha">Alpha</option>
        <option value="beta">Beta</option>
        <option value="gamma">Gamma</option>
      </uik-select>
    `);
    const select = await waitForUpdate<HTMLElement>("uik-select");
    const control = select.shadowRoot?.querySelector("select");
    if (!control) throw new Error("Select control missing.");
    const label = select.shadowRoot?.querySelector('[part="label"]');
    expect(control.value).toBe("beta");
    expect(label?.getAttribute("hidden")).toBeNull();
  });

  it("renders radio group", async () => {
    mount(html`
      <uik-radio-group name="billing" .value=${"monthly"}>
        <span slot="label">Billing</span>
        <span slot="hint">Choose a billing cadence.</span>
        <uik-radio value="monthly">
          <span slot="label">Monthly</span>
        </uik-radio>
        <uik-radio value="annual">
          <span slot="label">Annual</span>
        </uik-radio>
        <uik-radio value="lifetime">
          <span slot="label">Lifetime</span>
        </uik-radio>
      </uik-radio-group>
    `);
    const group = await waitForUpdate<HTMLElement>("uik-radio-group");
    await expect.element(group).toMatchScreenshot();
  });

  it("renders switch (on)", async () => {
    mount(html`
      <uik-switch ?checked=${true}>
        <span slot="label">Enable notifications</span>
        <span slot="hint">We will send you updates.</span>
      </uik-switch>
    `);
    const toggle = await waitForUpdate<HTMLElement>("uik-switch");
    await expect.element(toggle).toMatchScreenshot();
  });

  it("renders popover panel", async () => {
    mount(html`
      <uik-popover placement="bottom-start">
        <uik-button slot="trigger">Open popover</uik-button>
        <uik-text size="sm">Popover content anchored to the trigger.</uik-text>
      </uik-popover>
    `);
    const popover = await waitForUpdate<HTMLElement>("uik-popover");
    (popover as unknown as { open: boolean }).open = true;
    const withUpdate = popover as HTMLElement & {
      updateComplete?: Promise<unknown>;
    };
    if (withUpdate.updateComplete) {
      await withUpdate.updateComplete;
    }
    const panel = popover.shadowRoot?.querySelector(".panel");
    if (!panel) throw new Error("Popover panel missing.");
    await expect.element(panel).toMatchScreenshot();
  });

  it("renders tooltip panel", async () => {
    mount(html`
      <uik-tooltip ?open=${true}>
        <uik-button slot="trigger" variant="secondary">Hover me</uik-button>
        Helpful tooltip text.
      </uik-tooltip>
    `);
    const tooltip = await waitForUpdate<HTMLElement>("uik-tooltip");
    const panel = tooltip.shadowRoot?.querySelector(".panel");
    if (!panel) throw new Error("Tooltip panel missing.");
    await expect.element(panel).toMatchScreenshot();
  }, 30_000);
});
