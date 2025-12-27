import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@ismail-elkorchi/ui-shell/register";
import "@ismail-elkorchi/ui-primitives/register";

import { interactionStory } from "../../../.storybook/a11y";

type SidebarArgs = {
  heading: string;
  subtitle: string;
  isBodyPadded: boolean;
  isBodyScrollable: boolean;
  isFooterVisible: boolean;
};

const meta: Meta<SidebarArgs> = {
  title: "Shell/Sidebar",
  component: "uik-shell-sidebar",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Props: heading, subtitle, isBodyPadded, isBodyScrollable.",
          "Slots: actions, default, footer.",
          "Parts: sidebar, header, header-content, heading, subtitle, actions, body-container, body, footer.",
          "Custom properties: `--uik-component-shell-sidebar-bg`, `--uik-component-shell-sidebar-fg`, `--uik-component-shell-sidebar-width`, `--uik-component-shell-divider-color`, `--uik-component-shell-scrollbar-track`, `--uik-component-shell-scrollbar-thumb`.",
        ].join("\n"),
      },
    },
  },
  args: {
    heading: "Explorer",
    subtitle: "Workspace",
    isBodyPadded: true,
    isBodyScrollable: true,
    isFooterVisible: true,
  },
  render: (args) => {
    const actions = html`
      <uik-button slot="actions" variant="ghost" size="icon" aria-label="Add">
        <span>+</span>
      </uik-button>
      <uik-button slot="actions" variant="ghost" size="icon" aria-label="More">
        <span>...</span>
      </uik-button>
    `;

    const body = html`
      <div
        style="
          font-size: var(--uik-typography-font-size-1);
          line-height: var(--uik-typography-line-height-2);
          color: oklch(var(--uik-text-muted));
        "
      >
        Recent
      </div>
      <div
        style="display: flex; flex-direction: column; gap: var(--uik-space-2);"
      >
        <div style="font-size: var(--uik-typography-font-size-2);">
          design-system
        </div>
        <div
          style="
            font-size: var(--uik-typography-font-size-2);
            color: oklch(var(--uik-text-muted));
          "
        >
          marketing-site
        </div>
        <div
          style="
            font-size: var(--uik-typography-font-size-2);
            color: oklch(var(--uik-text-muted));
          "
        >
          platform-app
        </div>
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
          3 workspaces
        </div>`
      : undefined;

    return html`
      <div style="height: var(--uik-layout-panel-width-md);">
        <uik-shell-sidebar
          heading=${args.heading}
          subtitle=${args.subtitle}
          ?isBodyPadded=${args.isBodyPadded}
          ?isBodyScrollable=${args.isBodyScrollable}
          >${actions}${body}${footer}</uik-shell-sidebar
        >
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<SidebarArgs>;

export const Default: Story = {
  ...interactionStory,
};
