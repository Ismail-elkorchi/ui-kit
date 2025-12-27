import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

const meta: Meta = {
  title: "Primitives/Visually Hidden",
  component: "uik-visually-hidden",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A11y: provides screen-reader-only text while staying visually hidden.",
      },
    },
  },
  render: () => html`
    <uik-button size="icon" aria-label="Notifications">
      <span aria-hidden="true">🔔</span>
      <uik-visually-hidden>Notifications</uik-visually-hidden>
    </uik-button>
  `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  ...interactionStory,
};
