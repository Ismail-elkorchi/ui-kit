import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type TabsArgs = {
  activeId: string;
  orientation: "horizontal" | "vertical";
  activation: "auto" | "manual";
};

const meta: Meta<TabsArgs> = {
  title: "Primitives/Tabs",
  component: "uik-tabs",
  tags: ["autodocs"],
  args: {
    activeId: "overview",
    orientation: "horizontal",
    activation: "auto",
  },
  render: (args) => html`
    <uik-tabs
      .activeId=${args.activeId}
      orientation=${args.orientation}
      activation=${args.activation}
      aria-label="Project views"
      style=${args.orientation === "vertical"
        ? "max-width: var(--uik-layout-panel-width-sm);"
        : "max-width: var(--uik-layout-panel-width-lg);"}
    >
      <uik-tab value="overview">Overview</uik-tab>
      <uik-tab value="activity">Activity</uik-tab>
      <uik-tab value="settings">Settings</uik-tab>

      <uik-tab-panel value="overview">
        <p>Quick stats and highlights.</p>
      </uik-tab-panel>
      <uik-tab-panel value="activity">
        <p>Recent updates and audit events.</p>
      </uik-tab-panel>
      <uik-tab-panel value="settings">
        <p>Configuration and preferences.</p>
      </uik-tab-panel>
    </uik-tabs>
  `,
};

export default meta;

export const Default: StoryObj<TabsArgs> = {
  ...interactionStory,
};

export const Vertical: StoryObj<TabsArgs> = {
  ...interactionStory,
  args: {
    orientation: "vertical",
  },
};

export const ForcedColors: StoryObj<TabsArgs> = {
  ...interactionStory,
  parameters: {
    docs: {
      description: {
        story: "Use OS forced colors to verify indicator and focus treatment.",
      },
    },
  },
};
