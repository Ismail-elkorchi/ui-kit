import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type CommandPaletteArgs = {
  open: boolean;
  loading: boolean;
  disabled: boolean;
};

const items = [
  {
    id: "overview",
    label: "Getting started",
    description: "Quick tour of tokens and primitives.",
    group: "Docs",
  },
  {
    id: "tokens",
    label: "Tokens reference",
    description: "Semantic token tables and usage.",
    group: "Docs",
    shortcut: "T",
  },
  {
    id: "components",
    label: "Component contracts",
    description: "Props, slots, and parts by component.",
    group: "Docs",
  },
  {
    id: "shortcuts",
    label: "Keyboard shortcuts",
    description: "Global and context-specific hotkeys.",
    group: "Help",
  },
  {
    id: "disabled",
    label: "Coming soon",
    description: "This command is not available yet.",
    group: "Help",
    isDisabled: true,
  },
];

const meta: Meta<CommandPaletteArgs> = {
  title: "Primitives/Command Palette",
  component: "uik-command-palette",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    loading: false,
    disabled: false,
  },
  render: (args) => html`
    <uik-command-palette
      .items=${items}
      ?open=${args.open}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
      placeholder="Search docs and actions"
      style="width: min(90vw, var(--uik-layout-panel-width-md));"
    >
      <span slot="title">Command palette</span>
      <span slot="description">Find docs and shell actions.</span>
      <uik-visually-hidden slot="label">Search commands</uik-visually-hidden>
      <uik-text slot="footer" as="p" size="sm" tone="muted">
        Use Up/Down to navigate, Enter to select, Esc to close.
      </uik-text>
    </uik-command-palette>
  `,
};

export default meta;

type Story = StoryObj<CommandPaletteArgs>;

export const Default: Story = {
  ...interactionStory,
  tags: ["visual"],
};

export const Loading: Story = {
  ...interactionStory,
  args: { loading: true },
};

export const ForcedColors: Story = {
  ...interactionStory,
  parameters: {
    docs: {
      description: {
        story:
          "Use OS forced colors to verify listbox, focus, and highlight contrast.",
      },
    },
  },
};
