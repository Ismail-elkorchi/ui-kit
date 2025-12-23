import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

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
  title: 'Primitives/Textarea',
  component: 'uik-textarea',
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
    placeholder: 'Write a short message...',
    value: '',
    disabled: false,
    required: false,
    invalid: false,
    label: 'Message',
    hint: 'Keep it under 240 characters.',
    error: '',
  },
  render: args => html`
    <div style="padding: var(--uik-space-4); width: min(var(--uik-layout-panel-width-md), 90vw);">
      <uik-textarea
        placeholder=${args.placeholder}
        .value=${args.value}
        ?disabled=${args.disabled}
        ?required=${args.required}
        ?invalid=${args.invalid}>
        ${args.label ? html`<span slot="label">${args.label}</span>` : nothing}
        ${args.hint ? html`<span slot="hint">${args.hint}</span>` : nothing}
        ${args.error ? html`<span slot="error">${args.error}</span>` : nothing}
      </uik-textarea>
    </div>
  `,
};

export default meta;

type Story = StoryObj<TextareaArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const Filled: Story = {
  play: playA11y,
  args: {value: 'This is a longer textarea value.'},
};

export const Invalid: Story = {
  play: playA11y,
  args: {invalid: true, error: 'Please enter at least 10 characters.'},
};
