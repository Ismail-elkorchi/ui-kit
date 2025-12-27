import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type SeparatorArgs = {
  orientation: "horizontal" | "vertical";
};

const meta: Meta<SeparatorArgs> = {
  title: "Primitives/Separator",
  component: "uik-separator",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'A11y: horizontal renders as <hr>; vertical uses role="separator" with aria-orientation.',
      },
    },
  },
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      options: ["horizontal", "vertical"],
      control: { type: "radio" },
    },
  },
  render: (args) => {
    if (args.orientation === "vertical") {
      return html`
        <uik-stack direction="horizontal" gap="4" align="center">
          <span>Left</span>
          <uik-separator orientation="vertical"></uik-separator>
          <span>Right</span>
        </uik-stack>
      `;
    }

    return html`
      <uik-stack direction="vertical" gap="3">
        <span>Top</span>
        <uik-separator orientation="horizontal"></uik-separator>
        <span>Bottom</span>
      </uik-stack>
    `;
  },
};

export default meta;

type Story = StoryObj<SeparatorArgs>;

export const Default: Story = {
  ...interactionStory,
};
