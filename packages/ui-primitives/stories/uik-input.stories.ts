import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, nothing } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type InputArgs = {
  type: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<InputArgs> = {
  title: "Primitives/Input",
  component: "uik-input",
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
    type: "text",
    placeholder: "Type here...",
    value: "",
    disabled: false,
    required: false,
    invalid: false,
    label: "Email",
    hint: "We will never share your email.",
    error: "",
  },
  argTypes: {
    type: {
      control: { type: "text" },
    },
  },
  render: (args) => html`
    <uik-input
      type=${args.type}
      placeholder=${args.placeholder}
      .value=${args.value}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}
    >
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
    </uik-input>
  `,
};

export default meta;

type Story = StoryObj<InputArgs>;

export const Default: Story = {
  ...interactionStory,
};

export const Filled: Story = {
  ...interactionStory,
  args: { value: "hello@uik.dev" },
};

export const Disabled: Story = {
  ...interactionStory,
  args: { disabled: true, placeholder: "Disabled" },
};

export const Invalid: Story = {
  ...interactionStory,
  args: { invalid: true, error: "Please enter a valid email." },
};
