import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type SelectArgs = {
  value: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<SelectArgs> = {
  title: 'Primitives/Select',
  component: 'uik-select',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A11y: provide a label slot or aria-label; hint/error slots are announced via aria-describedby.',
      },
    },
  },
  args: {
    value: 'beta',
    disabled: false,
    required: false,
    invalid: false,
    label: 'Plan',
    hint: 'Choose your billing tier.',
    error: '',
  },
  render: args => html`
    <div style="padding: var(--uik-space-4); width: min(var(--uik-layout-panel-width-md), 90vw);">
      <uik-select .value=${args.value} ?disabled=${args.disabled} ?required=${args.required} ?invalid=${args.invalid}>
        ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
        ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
        ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
        <option value="alpha">Alpha</option>
        <option value="beta">Beta</option>
        <option value="gamma">Gamma</option>
      </uik-select>
    </div>
  `,
};

export default meta;

type Story = StoryObj<SelectArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const Disabled: Story = {
  play: playA11y,
  args: {disabled: true},
};
