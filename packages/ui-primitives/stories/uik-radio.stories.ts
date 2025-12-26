import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

type RadioArgs = {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<RadioArgs> = {
  title: 'Primitives/Radio',
  component: 'uik-radio',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A11y: provide a label slot or aria-label; hint/error slots are announced via aria-describedby.',
      },
    },
  },
  args: {
    checked: false,
    disabled: false,
    required: false,
    invalid: false,
    label: 'Monthly billing',
    hint: '',
    error: '',
  },
  render: args => html`
    <uik-radio
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}>
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
    </uik-radio>
  `,
};

export default meta;

type Story = StoryObj<RadioArgs>;


export const Default: Story = {
  ...interactionStory,
};

export const Checked: Story = {
  ...interactionStory,
  args: {checked: true},
};
