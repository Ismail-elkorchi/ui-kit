import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type PopoverArgs = {
  placement: 'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';
};

const meta: Meta<PopoverArgs> = {
  title: 'Primitives/Popover',
  component: 'uik-popover',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    placement: 'bottom-start',
  },
  render: args => html`
    <uik-popover placement=${args.placement}>
      <uik-button slot="trigger">Open popover</uik-button>
      <uik-text size="sm">Popover content anchored to the trigger.</uik-text>
    </uik-popover>
  `,
};

export default meta;

type Story = StoryObj<PopoverArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};
