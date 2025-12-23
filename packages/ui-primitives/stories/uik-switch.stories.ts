import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type SwitchArgs = {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<SwitchArgs> = {
  title: 'Primitives/Switch',
  component: 'uik-switch',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    checked: false,
    disabled: false,
    required: false,
    invalid: false,
    label: 'Enable notifications',
    hint: 'We will send you updates.',
    error: '',
  },
  render: args => html`
    <uik-switch
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}>
      ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
      ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
      ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
    </uik-switch>
  `,
};

export default meta;

type Story = StoryObj<SwitchArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const On: Story = {
  play: playA11y,
  args: {checked: true},
};
