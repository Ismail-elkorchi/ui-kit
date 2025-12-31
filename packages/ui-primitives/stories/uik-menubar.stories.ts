import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type MenubarArgs = Record<string, never>;

const meta: Meta<MenubarArgs> = {
  title: "Primitives/Menubar",
  component: "uik-menubar",
  tags: ["autodocs"],
  render: () => html`
    <uik-menubar aria-label="App menu">
      <uik-menu open>
        <uik-button slot="trigger" variant="ghost">File</uik-button>
        <uik-menu-item value="new">New</uik-menu-item>
        <uik-menu-item value="open">Open</uik-menu-item>
        <uik-menu-item value="export" disabled>Export</uik-menu-item>
      </uik-menu>
      <uik-menu>
        <uik-button slot="trigger" variant="ghost">Edit</uik-button>
        <uik-menu-item value="undo">Undo</uik-menu-item>
        <uik-menu-item value="redo" disabled>Redo</uik-menu-item>
        <uik-menu-item value="prefs">Preferences</uik-menu-item>
      </uik-menu>
      <uik-menu>
        <uik-button slot="trigger" variant="ghost">View</uik-button>
        <uik-menu-item value="status">Status Bar</uik-menu-item>
        <uik-menu-item value="activity">Activity Bar</uik-menu-item>
      </uik-menu>
    </uik-menubar>
  `,
};

export default meta;

export const Default: StoryObj<MenubarArgs> = {
  ...interactionStory,
};

export const ForcedColors: StoryObj<MenubarArgs> = {
  ...interactionStory,
  parameters: {
    docs: {
      description: {
        story: "Use OS forced colors to verify menubar and trigger contrast.",
      },
    },
  },
};
