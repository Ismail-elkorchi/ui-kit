import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type ResizablePanelsArgs = {
  orientation: "horizontal" | "vertical";
};

const meta: Meta<ResizablePanelsArgs> = {
  title: "Primitives/Resizable Panels",
  component: "uik-resizable-panels",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Slots: start, end.",
          "Parts: base, panel-start, panel-end, handle, handle-grip.",
          "Event: resizable-panels-resize (detail: {startSize, endSize, ratio, source, phase}).",
          'A11y: handle uses role="separator" and supports Arrow/Home/End + Shift+Arrow.',
          "Motion/contrast: handle transitions use motion tokens; forced-colors uses system colors.",
        ].join("\n"),
      },
    },
  },
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      options: ["horizontal", "vertical"],
      control: { type: "radio" },
    },
  },
  render: (args) => {
    const isVertical = args.orientation === "vertical";
    const containerStyles = `
      width: ${isVertical ? "var(--uik-layout-panel-width-md)" : "var(--uik-layout-panel-width-lg)"};
      height: ${isVertical ? "var(--uik-layout-panel-width-lg)" : "var(--uik-layout-panel-width-md)"};
      --uik-component-resizable-panels-panel-min-size: var(--uik-space-12);
      --uik-component-resizable-panels-panel-start-size: var(--uik-layout-panel-width-sm);
      border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
      border-radius: var(--uik-radius-3);
      overflow: hidden;
      background-color: oklch(var(--uik-surface-bg));
    `;
    const panelStyles = `
      display: flex;
      flex-direction: column;
      gap: var(--uik-space-3);
      padding: var(--uik-space-4);
      height: 100%;
      box-sizing: border-box;
      font-size: var(--uik-typography-font-size-2);
    `;

    return html`
      <div style=${containerStyles}>
        <uik-resizable-panels
          orientation=${args.orientation}
          aria-label="Editor split"
        >
          <div slot="start" style=${panelStyles}>
            <strong
              style="font-weight: var(--uik-typography-font-weight-semibold);"
              >Explorer</strong
            >
            <div style="color: oklch(var(--uik-text-muted));">src</div>
            <div style="color: oklch(var(--uik-text-muted));">components</div>
            <div style="color: oklch(var(--uik-text-muted));">tokens</div>
          </div>
          <div slot="end" style=${panelStyles}>
            <strong
              style="font-weight: var(--uik-typography-font-weight-semibold);"
              >Editor</strong
            >
            <div
              style="
                padding: var(--uik-space-3);
                border-radius: var(--uik-radius-2);
                border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
                background-color: oklch(var(--uik-surface-card));
                color: oklch(var(--uik-text-muted));
              "
            >
              Use the handle to resize.
            </div>
          </div>
        </uik-resizable-panels>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<ResizablePanelsArgs>;

export const Default: Story = {
  ...interactionStory,
};

export const Vertical: Story = {
  ...interactionStory,
  args: {
    orientation: "vertical",
  },
};
