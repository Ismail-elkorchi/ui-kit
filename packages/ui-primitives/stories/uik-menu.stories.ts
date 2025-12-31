import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type MenuArgs = {
  open: boolean;
};

const meta: Meta<MenuArgs> = {
  title: "Primitives/Menu",
  component: "uik-menu",
  tags: ["autodocs"],
  args: {
    open: true,
  },
  render: (args) => html`
    <uik-menu .open=${args.open} placement="bottom-start" aria-label="File">
      <uik-button slot="trigger" variant="ghost">File</uik-button>
      <uik-menu-item value="new">New</uik-menu-item>
      <uik-menu-item value="open">Open</uik-menu-item>
      <uik-menu-item value="export" disabled>Export</uik-menu-item>
    </uik-menu>
  `,
};

export default meta;

export const Default: StoryObj<MenuArgs> = {
  ...interactionStory,
};

export const ForcedColors: StoryObj<MenuArgs> = {
  ...interactionStory,
  parameters: {
    docs: {
      description: {
        story: "Use OS forced colors to verify menu focus and hover contrast.",
      },
    },
  },
};
