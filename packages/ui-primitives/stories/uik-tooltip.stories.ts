import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

const meta: Meta = {
  title: 'Primitives/Tooltip',
  component: 'uik-tooltip',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: () => html`
    <uik-tooltip>
      <uik-button slot="trigger" variant="secondary">Hover me</uik-button>
      Helpful tooltip text.
    </uik-tooltip>
  `,
};

export default meta;

type Story = StoryObj;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};
