import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

const meta: Meta = {
  title: "Primitives/Tooltip",
  component: "uik-tooltip",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  render: () => html`
    <uik-tooltip>
      <uik-button slot="trigger" variant="secondary">Hover me</uik-button>
      Helpful tooltip text.
    </uik-tooltip>
  `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  ...interactionStory,
};
