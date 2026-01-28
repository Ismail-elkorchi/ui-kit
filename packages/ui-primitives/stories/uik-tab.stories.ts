import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type TabArgs = {
  activeId: string;
  disabled: boolean;
};

const meta: Meta<TabArgs> = {
  title: "Primitives/Tab",
  component: "uik-tab",
  tags: ["autodocs"],
  args: {
    activeId: "overview",
    disabled: false,
  },
  render: (args) => html`
    <uik-tabs .activeId=${args.activeId} aria-label="Project views">
      <uik-tab value="overview" ?disabled=${args.disabled}>Overview</uik-tab>
      <uik-tab value="activity">Activity</uik-tab>
      <uik-tab-panel value="overview">
        <p>Overview content.</p>
      </uik-tab-panel>
      <uik-tab-panel value="activity">
        <p>Activity content.</p>
      </uik-tab-panel>
    </uik-tabs>
  `,
};

export default meta;

export const Default: StoryObj<TabArgs> = {
  ...interactionStory,
};

export const Disabled: StoryObj<TabArgs> = {
  ...interactionStory,
  args: {
    disabled: true,
  },
};
