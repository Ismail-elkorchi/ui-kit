import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type ButtonArgs = {
  label: string;
  variant: "solid" | "danger" | "outline" | "secondary" | "ghost" | "link";
  size: "default" | "sm" | "lg" | "icon";
  disabled: boolean;
  active: boolean;
  muted: boolean;
  type: "button" | "submit" | "reset";
  tabIndexValue: number;
};

const meta: Meta<ButtonArgs> = {
  title: "Primitives/Button",
  component: "uik-button",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A11y: native <button> semantics, ensure visible text/aria-label, use aria-pressed for toggle state, use disabled for non-interactive state. Use tabIndexValue for roving focus.",
      },
    },
  },
  args: {
    label: "Click me",
    variant: "solid",
    size: "default",
    disabled: false,
    active: false,
    muted: false,
    type: "button",
    tabIndexValue: 0,
  },
  argTypes: {
    variant: {
      options: ["solid", "danger", "outline", "secondary", "ghost", "link"],
      control: { type: "select" },
    },
    size: {
      options: ["default", "sm", "lg", "icon"],
      control: { type: "select" },
    },
    type: {
      options: ["button", "submit", "reset"],
      control: { type: "radio" },
    },
    tabIndexValue: {
      control: { type: "number" },
    },
  },
  render: ({ label, ...args }) => html`
    <uik-button
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      .tabIndexValue=${args.tabIndexValue}
      ?disabled=${args.disabled}
      ?active=${args.active}
      ?muted=${args.muted}
    >
      ${label}
    </uik-button>
  `,
};

export default meta;

type Story = StoryObj<ButtonArgs>;

export const Solid: Story = {
  ...interactionStory,
};

export const Danger: Story = {
  ...interactionStory,
  args: { variant: "danger", label: "Delete" },
};

export const GhostMuted: Story = {
  ...interactionStory,
  args: { variant: "ghost", label: "Muted ghost", muted: true },
};

export const IconButton: Story = {
  ...interactionStory,
  args: { label: "★", size: "icon", variant: "secondary", type: "button" },
  render: ({ label, ...args }) => html`
    <uik-button
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      .tabIndexValue=${args.tabIndexValue}
      aria-label="Favorite"
      ?disabled=${args.disabled}
      ?active=${args.active}
      ?muted=${args.muted}
    >
      ${label}
    </uik-button>
  `,
};
