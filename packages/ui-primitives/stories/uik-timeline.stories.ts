import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type TimelineArgs = {
  density: "comfortable" | "compact";
};

const items = [
  {
    title: "Queued release",
    description: "Awaiting approvals from compliance.",
    meta: "09:12",
    status: "Queued",
  },
  {
    title: "Build completed",
    description: "Artifacts uploaded to registry.",
    meta: "09:18",
    status: "Success",
  },
  {
    title: "Deploy running",
    description: "Pushing assets to production.",
    meta: "09:22",
    status: "Running",
  },
];

const meta: Meta<TimelineArgs> = {
  title: "Primitives/Timeline",
  component: "uik-timeline",
  tags: ["autodocs"],
  args: {
    density: "comfortable",
  },
  render: (args) => html`
    <uik-timeline
      aria-label="Run history"
      density=${args.density}
      .items=${items}
    ></uik-timeline>
  `,
};

export default meta;

type Story = StoryObj<TimelineArgs>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    density: "compact",
  },
};

export const Visual: Story = {
  tags: ["visual"],
  render: () => html`
    <uik-timeline aria-label="Run history" .items=${items}></uik-timeline>
  `,
};
