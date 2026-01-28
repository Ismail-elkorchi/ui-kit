import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type TabPanelArgs = {
  activeId: string;
};

const meta: Meta<TabPanelArgs> = {
  title: "Primitives/Tab Panel",
  component: "uik-tab-panel",
  tags: ["autodocs"],
  args: {
    activeId: "overview",
  },
  render: (args) => html`
    <uik-tabs .activeId=${args.activeId} aria-label="Project views">
      <uik-tab value="overview">Overview</uik-tab>
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

export const Default: StoryObj<TabPanelArgs> = {
  ...interactionStory,
};
