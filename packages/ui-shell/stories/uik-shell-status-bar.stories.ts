import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@ismail-elkorchi/ui-shell/register";

import { interactionStory } from "../../../.storybook/a11y";

type StatusBarArgs = {
  message: string;
  tone: "info" | "success" | "danger" | "muted";
  meta: string;
};

const meta: Meta<StatusBarArgs> = {
  title: "Shell/Status Bar",
  component: "uik-shell-status-bar",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Props: message, tone, meta.",
          "Slots: actions, meta.",
          "Parts: status-bar, status-main, message, actions, meta.",
          "Custom properties: `--uik-component-shell-status-bar-bg`, `--uik-component-shell-status-bar-fg`, `--uik-component-shell-status-bar-height`, `--uik-component-shell-divider-color`.",
        ].join("\n"),
      },
    },
  },
  args: {
    message: "Ready",
    tone: "info",
    meta: "3 files selected",
  },
  argTypes: {
    tone: {
      options: ["info", "success", "danger", "muted"],
      control: { type: "select" },
    },
  },
  render: (args) => html`
    <div style="width: min(100%, var(--uik-layout-panel-width-lg));">
      <uik-shell-status-bar
        message=${args.message}
        tone=${args.tone}
        meta=${args.meta}
      >
        <span
          slot="actions"
          style="
            font-size: var(--uik-typography-font-size-1);
            line-height: var(--uik-typography-line-height-2);
            color: oklch(var(--uik-text-muted));
          "
        >
          Main
        </span>
      </uik-shell-status-bar>
    </div>
  `,
};

export default meta;

type Story = StoryObj<StatusBarArgs>;

export const Default: Story = {
  ...interactionStory,
};
