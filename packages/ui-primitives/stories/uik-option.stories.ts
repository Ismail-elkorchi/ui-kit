import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type OptionArgs = {
  disabled: boolean;
  value: string;
};

const meta: Meta<OptionArgs> = {
  title: "Primitives/Option",
  component: "uik-option",
  tags: ["autodocs"],
  args: {
    disabled: false,
    value: "standard",
  },
  render: (args) => html`
    <uik-listbox
      .value=${args.value}
      aria-label="Shipping speed"
      style="max-width: var(--uik-layout-panel-width-sm);"
    >
      <uik-option value="standard" ?disabled=${args.disabled}>
        Standard (3-5 days)
      </uik-option>
      <uik-option value="express">Express (1-2 days)</uik-option>
    </uik-listbox>
  `,
};

export default meta;

export const Default: StoryObj<OptionArgs> = {
  ...interactionStory,
};

export const Disabled: StoryObj<OptionArgs> = {
  ...interactionStory,
  args: {
    disabled: true,
  },
};
