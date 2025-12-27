import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, nothing } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type TextareaArgs = {
  placeholder: string;
  value: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<TextareaArgs> = {
  title: "Primitives/Textarea",
  component: "uik-textarea",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A11y: provide a label slot or aria-label; hint/error slots are announced via aria-describedby.",
      },
    },
  },
  args: {
    placeholder: "Write a short message...",
    value: "",
    disabled: false,
    required: false,
    invalid: false,
    label: "Message",
    hint: "Keep it under 240 characters.",
    error: "",
  },
  render: (args) => html`
    <uik-textarea
      placeholder=${args.placeholder}
      .value=${args.value}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}
    >
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
    </uik-textarea>
  `,
};

export default meta;

type Story = StoryObj<TextareaArgs>;

export const Default: Story = {
  ...interactionStory,
};

export const Filled: Story = {
  ...interactionStory,
  args: { value: "This is a longer textarea value." },
};

export const Invalid: Story = {
  ...interactionStory,
  args: { invalid: true, error: "Please enter at least 10 characters." },
};
