import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type LinkArgs = {
  label: string;
  href: string;
  target: string;
};

const meta: Meta<LinkArgs> = {
  title: "Primitives/Link",
  component: "uik-link",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A11y: provide visible link text or aria-label.",
      },
    },
  },
  args: {
    label: "Read the docs",
    href: "https://example.com",
    target: "_blank",
  },
  render: (args) => html`
    <uik-link href=${args.href} target=${args.target} rel="noopener noreferrer">
      ${args.label}
    </uik-link>
  `,
};

export default meta;

type Story = StoryObj<LinkArgs>;

export const Default: Story = {
  ...interactionStory,
};
