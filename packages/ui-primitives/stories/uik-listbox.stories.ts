import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type ListboxArgs = {
  value: string;
  selectionMode: "single" | "multiple";
};

const meta: Meta<ListboxArgs> = {
  title: "Primitives/Listbox",
  component: "uik-listbox",
  tags: ["autodocs"],
  args: {
    value: "shipping",
    selectionMode: "single",
  },
  render: (args) => html`
    <uik-listbox
      .value=${args.value}
      selection-mode=${args.selectionMode}
      aria-label="Shipping speed"
      style="max-width: var(--uik-layout-panel-width-sm);"
    >
      <uik-option value="standard">Standard (3-5 days)</uik-option>
      <uik-option value="shipping">Express (1-2 days)</uik-option>
      <uik-option value="overnight" disabled>Overnight (sold out)</uik-option>
    </uik-listbox>
  `,
};

export default meta;

export const Default: StoryObj<ListboxArgs> = {
  ...interactionStory,
};

export const Multiple: StoryObj<ListboxArgs> = {
  ...interactionStory,
  args: {
    selectionMode: "multiple",
    value: "",
  },
  render: () => html`
    <uik-listbox selection-mode="multiple" aria-label="Alert channels">
      <uik-option value="email">Email</uik-option>
      <uik-option value="sms">SMS</uik-option>
      <uik-option value="push">Push</uik-option>
    </uik-listbox>
  `,
};

export const ForcedColors: StoryObj<ListboxArgs> = {
  ...interactionStory,
  parameters: {
    docs: {
      description: {
        story: "Use OS forced colors to verify focus and selection contrast.",
      },
    },
  },
};
