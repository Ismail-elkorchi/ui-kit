import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type SpinnerArgs = {
  size: "sm" | "md" | "lg";
  tone:
    | "default"
    | "muted"
    | "primary"
    | "danger"
    | "success"
    | "warning"
    | "info";
};

const meta: Meta<SpinnerArgs> = {
  title: "Primitives/Spinner",
  component: "uik-spinner",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    size: "md",
    tone: "primary",
  },
  render: (args) => html`
    <uik-spinner size=${args.size} tone=${args.tone}></uik-spinner>
  `,
};

export default meta;

type Story = StoryObj<SpinnerArgs>;

export const Default: Story = {
  ...interactionStory,
};
