import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type SpinnerArgs = {
  size: 'sm' | 'md' | 'lg';
  tone: 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning' | 'info';
};

const meta: Meta<SpinnerArgs> = {
  title: 'Primitives/Spinner',
  component: 'uik-spinner',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    size: 'md',
    tone: 'primary',
  },
  render: args => html`
    <uik-spinner size=${args.size} tone=${args.tone}></uik-spinner>
  `,
};

export default meta;

type Story = StoryObj<SpinnerArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};
