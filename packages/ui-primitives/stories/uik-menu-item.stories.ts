import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type MenuItemArgs = {
  disabled: boolean;
};

const meta: Meta<MenuItemArgs> = {
  title: "Primitives/Menu Item",
  component: "uik-menu-item",
  tags: ["autodocs"],
  args: {
    disabled: false,
  },
  render: (args) => html`
    <uik-menu open placement="bottom-start" aria-label="Actions">
      <uik-button slot="trigger" variant="ghost">Actions</uik-button>
      <uik-menu-item value="rename" ?disabled=${args.disabled}>
        Rename
      </uik-menu-item>
      <uik-menu-item value="share">Share</uik-menu-item>
    </uik-menu>
  `,
};

export default meta;

export const Default: StoryObj<MenuItemArgs> = {
  ...interactionStory,
};

export const Disabled: StoryObj<MenuItemArgs> = {
  ...interactionStory,
  args: {
    disabled: true,
  },
};
