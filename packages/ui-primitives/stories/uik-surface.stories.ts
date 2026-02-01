import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type SurfaceArgs = {
  variant: "base" | "muted" | "card" | "elevated" | "popover";
  bordered: boolean;
};

const meta: Meta<SurfaceArgs> = {
  title: "Primitives/Surface",
  component: "uik-surface",
  tags: ["autodocs", "visual"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "card",
    bordered: true,
  },
  render: (args) => html`
    <uik-surface variant=${args.variant} ?bordered=${args.bordered}>
      <uik-box padding="4">
        <uik-heading level="4">Surface title</uik-heading>
        <uik-text tone="muted">Token-backed container content.</uik-text>
      </uik-box>
    </uik-surface>
  `,
};

export default meta;

type Story = StoryObj<SurfaceArgs>;

export const Default: Story = {
  ...interactionStory,
};
