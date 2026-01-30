import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type DescriptionListArgs = {
  density: "comfortable" | "compact";
  layout: "auto" | "columns" | "stacked";
};

const meta: Meta<DescriptionListArgs> = {
  title: "Primitives/Description List",
  component: "uik-description-list",
  tags: ["autodocs"],
  args: {
    density: "comfortable",
    layout: "auto",
  },
  render: (args) => html`
    <uik-description-list
      density=${args.density}
      layout=${args.layout}
      style="max-width: var(--uik-layout-panel-width-md);"
    >
      <dt>Queue</dt>
      <dd>Active</dd>
      <dt>Owner</dt>
      <dd>UIK CLI</dd>
      <dt>Target</dt>
      <dd><uik-code-block inline>0.2.0</uik-code-block></dd>
    </uik-description-list>
  `,
};

export default meta;

export const Default: StoryObj<DescriptionListArgs> = {
  ...interactionStory,
};

export const Compact: StoryObj<DescriptionListArgs> = {
  ...interactionStory,
  args: {
    density: "compact",
  },
};

export const Stacked: StoryObj<DescriptionListArgs> = {
  ...interactionStory,
  args: {
    layout: "stacked",
  },
};
