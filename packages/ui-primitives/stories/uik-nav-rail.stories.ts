import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

const items = [
  {
    id: "explorer",
    label: "Explorer",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    id: "search",
    label: "Search",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "M10 4h4l1 3 3 1v4l-3 1-1 3h-4l-1-3-3-1V8l3-1 1-3z",
  },
];

type UikNavRailArgs = {
  activeId: string;
  orientation: "vertical" | "horizontal";
};

const meta: Meta<UikNavRailArgs> = {
  title: "Primitives/Nav Rail",
  component: "uik-nav-rail",
  tags: ["autodocs"],
  render: (args) => html`
    <uik-nav-rail
      .items=${items}
      .activeId=${args.activeId}
      .orientation=${args.orientation}
      aria-label="Primary navigation"
    ></uik-nav-rail>
  `,
};

export default meta;

export const Default: StoryObj<UikNavRailArgs> = {
  args: {
    activeId: "explorer",
    orientation: "vertical",
  },
  ...interactionStory,
};
