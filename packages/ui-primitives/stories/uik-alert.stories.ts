import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type AlertArgs = {
  variant: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
};

const meta: Meta<AlertArgs> = {
  title: 'Primitives/Alert',
  component: 'uik-alert',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    variant: 'neutral',
  },
  render: args => html`
    <uik-alert variant=${args.variant} style="max-width: var(--uik-layout-panel-width-md);">
      <span slot="title">Heads up</span>
      This is an alert message that uses intent tokens.
    </uik-alert>
  `,
};

export default meta;

type Story = StoryObj<AlertArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const Danger: Story = {
  play: playA11y,
  args: {variant: 'danger'},
};
