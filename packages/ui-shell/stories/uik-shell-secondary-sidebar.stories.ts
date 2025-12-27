import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@ismail-elkorchi/ui-shell/register";

import { interactionStory } from "../../../.storybook/a11y";

type SecondarySidebarArgs = {
  isOpen: boolean;
  heading: string;
  isFooterVisible: boolean;
};

const meta: Meta<SecondarySidebarArgs> = {
  title: "Shell/Secondary Sidebar",
  component: "uik-shell-secondary-sidebar",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Props: isOpen, heading. Event: secondary-sidebar-close.",
          "Slots: default, footer.",
          "Parts: secondary-sidebar, header, heading, close-button, close-icon, body-container, body, footer.",
          "Custom properties: `--uik-component-shell-secondary-sidebar-bg`, `--uik-component-shell-secondary-sidebar-width`, `--uik-component-shell-divider-color`, `--uik-component-shell-scrollbar-track`, `--uik-component-shell-scrollbar-thumb`.",
        ].join("\n"),
      },
    },
  },
  args: {
    isOpen: true,
    heading: "Assistant",
    isFooterVisible: true,
  },
  render: (args) => {
    const body = html`
      <div
        style="display: flex; flex-direction: column; gap: var(--uik-space-3);"
      >
        <p>Summarize the last commit.</p>
        <p
          style="
            font-size: var(--uik-typography-font-size-1);
            line-height: var(--uik-typography-line-height-2);
            color: oklch(var(--uik-text-muted));
          "
        >
          Tip: keep it short and focused.
        </p>
      </div>
    `;

    const footer = args.isFooterVisible
      ? html`<div
          slot="footer"
          style="
            font-size: var(--uik-typography-font-size-1);
            line-height: var(--uik-typography-line-height-2);
            color: oklch(var(--uik-text-muted));
          "
        >
          Powered by UIK
        </div>`
      : undefined;

    return html`
      <div style="height: var(--uik-layout-panel-width-md);">
        <uik-shell-secondary-sidebar
          ?isOpen=${args.isOpen}
          heading=${args.heading}
        >
          ${body} ${footer}
        </uik-shell-secondary-sidebar>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<SecondarySidebarArgs>;

export const Default: Story = {
  ...interactionStory,
};
