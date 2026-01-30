import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, nothing } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type SelectArgs = {
  value: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const controlRowItems = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
];

const meta: Meta<SelectArgs> = {
  title: "Primitives/Select",
  component: "uik-select",
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
    value: "beta",
    disabled: false,
    required: false,
    invalid: false,
    label: "Plan",
    hint: "Choose your billing tier.",
    error: "",
  },
  render: (args) => html`
    <uik-select
      .value=${args.value}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}
    >
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
      <option value="alpha">Alpha</option>
      <option value="beta">Beta</option>
      <option value="gamma">Gamma</option>
    </uik-select>
  `,
};

export default meta;

type Story = StoryObj<SelectArgs>;

export const Default: Story = {
  ...interactionStory,
};

export const Disabled: Story = {
  ...interactionStory,
  args: { disabled: true },
};

export const AlignedRow: Story = {
  render: () => html`
    <div style="display: grid; gap: var(--uik-space-4);">
      <div style="display: flex; gap: var(--uik-space-4); align-items: center;">
        <uik-input aria-label="Workspace" value="Workspace"></uik-input>
        <uik-select aria-label="Plan">
          <option value="alpha">Alpha</option>
          <option value="beta">Beta</option>
        </uik-select>
        <uik-combobox
          aria-label="Owner"
          .items=${controlRowItems}
        ></uik-combobox>
      </div>
    </div>
  `,
};
