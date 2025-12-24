import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type ProgressArgs = {
  value: number;
  max: number;
  indeterminate: boolean;
};

const meta: Meta<ProgressArgs> = {
  title: 'Primitives/Progress',
  component: 'uik-progress',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 45,
    max: 100,
    indeterminate: false,
  },
  render: args => html`
    <uik-progress
      .value=${args.value}
      .max=${args.max}
      ?indeterminate=${args.indeterminate}
      aria-label="Upload progress"></uik-progress>
  `,
};

export default meta;

type Story = StoryObj<ProgressArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const Indeterminate: Story = {
  play: playA11y,
  args: {indeterminate: true},
};
