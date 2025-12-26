import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

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
    <uik-alert variant=${args.variant}>
      <span slot="title">Heads up</span>
      This is an alert message that uses intent tokens.
    </uik-alert>
  `,
};

export default meta;

type Story = StoryObj<AlertArgs>;


export const Default: Story = {
  ...interactionStory,
};

export const Danger: Story = {
  ...interactionStory,
  args: {variant: 'danger'},
};
