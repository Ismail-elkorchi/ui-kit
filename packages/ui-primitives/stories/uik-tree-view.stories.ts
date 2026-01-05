import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type TreeViewArgs = {
  openIds: string[];
  currentId: string;
};

const items = [
  {
    id: "apps",
    label: "apps",
    children: [
      { id: "apps/main.ts", label: "main.ts" },
      { id: "apps/routes.ts", label: "routes.ts" },
    ],
  },
  {
    id: "packages",
    label: "packages",
    children: [
      { id: "packages/ui-primitives", label: "ui-primitives" },
      { id: "packages/ui-shell", label: "ui-shell" },
    ],
  },
];

const meta: Meta<TreeViewArgs> = {
  title: "Primitives/Tree View",
  component: "uik-tree-view",
  tags: ["autodocs"],
  args: {
    openIds: ["apps", "packages"],
    currentId: "apps/main.ts",
  },
  render: (args) => html`
    <uik-tree-view
      .items=${items}
      .openIds=${args.openIds}
      .currentId=${args.currentId}
      aria-label="Project files"
    >
    </uik-tree-view>
  `,
};

export default meta;

type Story = StoryObj<TreeViewArgs>;

export const Default: Story = {
  ...interactionStory,
};
