import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type HeadingArgs = {
  level: number;
  tone:
    | "default"
    | "strong"
    | "muted"
    | "danger"
    | "success"
    | "warning"
    | "info";
  leading: "compact" | "roomy";
};

const meta: Meta<HeadingArgs> = {
  title: "Primitives/Heading",
  component: "uik-heading",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    level: 2,
    tone: "strong",
    leading: "compact",
  },
  render: (args) => html`
    <uik-heading level=${args.level} tone=${args.tone} leading=${args.leading}>
      Section heading
    </uik-heading>
  `,
};

export default meta;

type Story = StoryObj<HeadingArgs>;

export const Default: Story = {
  ...interactionStory,
};

export const Roomy: Story = {
  ...interactionStory,
  args: {
    leading: "roomy",
  },
};
