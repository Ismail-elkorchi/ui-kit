import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

type RadioGroupArgs = {
  value: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
  orientation: 'vertical' | 'horizontal';
};

const meta: Meta<RadioGroupArgs> = {
  title: 'Primitives/Radio Group',
  component: 'uik-radio-group',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 'monthly',
    disabled: false,
    required: false,
    invalid: false,
    label: 'Billing',
    hint: 'Choose a billing cadence.',
    error: '',
    orientation: 'vertical',
  },
  render: args => html`
    <uik-radio-group
      name="billing"
      .value=${args.value}
      orientation=${args.orientation}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}>
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
      <uik-radio value="monthly">
        <span slot="label">Monthly</span>
      </uik-radio>
      <uik-radio value="annual">
        <span slot="label">Annual</span>
      </uik-radio>
      <uik-radio value="lifetime">
        <span slot="label">Lifetime</span>
      </uik-radio>
    </uik-radio-group>
  `,
};

export default meta;

type Story = StoryObj<RadioGroupArgs>;


export const Default: Story = {
  ...interactionStory,
};

export const Horizontal: Story = {
  ...interactionStory,
  args: {orientation: 'horizontal'},
};
