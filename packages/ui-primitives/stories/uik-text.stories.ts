import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type TextArgs = {
  as: 'span' | 'p' | 'div' | 'label';
  size: 'sm' | 'md' | 'lg' | 'xl';
  weight: 'regular' | 'medium' | 'semibold' | 'bold';
  tone: 'default' | 'muted' | 'strong' | 'danger' | 'success' | 'warning' | 'info';
  truncate: boolean;
};

const meta: Meta<TextArgs> = {
  title: 'Primitives/Text',
  component: 'uik-text',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    as: 'span',
    size: 'md',
    weight: 'regular',
    tone: 'default',
    truncate: false,
  },
  render: args => html`
    <uik-text
      as=${args.as}
      size=${args.size}
      weight=${args.weight}
      tone=${args.tone}
      ?truncate=${args.truncate}
      style="max-width: var(--uik-layout-panel-width-sm);">
      Typography token sample for the UI primitives.
    </uik-text>
  `,
};

export default meta;

type Story = StoryObj<TextArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};
