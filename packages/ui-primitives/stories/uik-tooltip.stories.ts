import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type TooltipArgs = {
  open: boolean;
};

const meta: Meta<TooltipArgs> = {
  title: "Primitives/Tooltip",
  component: "uik-tooltip",
  tags: ["autodocs", "visual"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
  },
  render: (args) => html`
    <uik-tooltip ?open=${args.open}>
      <uik-button slot="trigger" variant="secondary">Hover me</uik-button>
      Helpful tooltip text.
    </uik-tooltip>
  `,
};

export default meta;

type Story = StoryObj<TooltipArgs>;

export const Default: Story = {
  ...interactionStory,
};
