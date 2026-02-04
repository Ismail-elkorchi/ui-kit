import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type TagInputArgs = {
  values: string[];
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
};

const meta: Meta<TagInputArgs> = {
  title: "Primitives/Tag Input",
  component: "uik-tag-input",
  tags: ["autodocs"],
  args: {
    values: ["design", "quality", "ops"],
    placeholder: "Add tag",
    disabled: false,
    readonly: false,
  },
  render: (args) => html`
    <uik-tag-input
      aria-label="Project tags"
      .values=${args.values}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      style="max-width: var(--uik-layout-panel-width-md);"
    ></uik-tag-input>
  `,
};

export default meta;

type Story = StoryObj<TagInputArgs>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};

export const Visual: Story = {
  tags: ["visual"],
  render: () => html`
    <uik-tag-input
      aria-label="Visual tags"
      .values=${["alpha", "beta", "longer-tag", "priority"]}
      placeholder="Add tag"
      style="max-width: var(--uik-layout-panel-width-md);"
    ></uik-tag-input>
  `,
};
