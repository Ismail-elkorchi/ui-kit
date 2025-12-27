import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type ComboboxArgs = {
  value: string;
  open: boolean;
  disabled: boolean;
};

const items = [
  { id: "queue", label: "Queue" },
  { id: "running", label: "Running" },
  { id: "blocked", label: "Blocked" },
];

const meta: Meta<ComboboxArgs> = {
  title: "Primitives/Combobox",
  component: "uik-combobox",
  tags: ["autodocs"],
  args: {
    value: "",
    open: false,
    disabled: false,
  },
  render: (args) => html`
    <uik-combobox
      .items=${items}
      .value=${args.value}
      .open=${args.open}
      ?disabled=${args.disabled}
      placeholder="Filter status"
      aria-label="Status"
      style="max-width: var(--uik-layout-panel-width-sm);"
    >
      <span slot="label">Status</span>
      <span slot="hint">Use arrow keys to browse options.</span>
    </uik-combobox>
  `,
};

export default meta;

export const Default: StoryObj<ComboboxArgs> = {
  ...interactionStory,
};

export const Open: StoryObj<ComboboxArgs> = {
  ...interactionStory,
  args: { open: true },
};

export const ForcedColors: StoryObj<ComboboxArgs> = {
  ...interactionStory,
  parameters: {
    docs: {
      description: {
        story: "Use OS forced colors to verify input and listbox contrast.",
      },
    },
  },
};
