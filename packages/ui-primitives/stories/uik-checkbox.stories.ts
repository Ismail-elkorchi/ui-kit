import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, nothing } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type CheckboxArgs = {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<CheckboxArgs> = {
  title: "Primitives/Checkbox",
  component: "uik-checkbox",
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
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    invalid: false,
    label: "Send me product updates",
    hint: "You can unsubscribe at any time.",
    error: "",
  },
  render: (args) => html`
    <uik-checkbox
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}
    >
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
    </uik-checkbox>
  `,
};

export default meta;

type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {
  ...interactionStory,
};

export const Checked: Story = {
  ...interactionStory,
  args: { checked: true },
};

export const Indeterminate: Story = {
  ...interactionStory,
  args: { indeterminate: true },
};
