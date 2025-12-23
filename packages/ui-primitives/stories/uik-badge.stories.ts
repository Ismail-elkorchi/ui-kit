import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type BadgeArgs = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

const meta: Meta<BadgeArgs> = {
  title: 'Primitives/Badge',
  component: 'uik-badge',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A11y: non-interactive label; provide meaningful text content.',
      },
    },
  },
  args: {
    label: 'Status',
    variant: 'default',
  },
  argTypes: {
    variant: {
      options: ['default', 'secondary', 'destructive', 'outline'],
      control: {type: 'select'},
    },
  },
  render: ({label, ...args}) => html`
    <div style="display: inline-flex; gap: var(--uik-space-3); align-items: center; padding: var(--uik-space-4);">
      <uik-badge variant=${args.variant}>${label}</uik-badge>
    </div>
  `,
};

export default meta;

type Story = StoryObj<BadgeArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const Secondary: Story = {
  play: playA11y,
  args: {variant: 'secondary', label: 'Secondary'},
};

export const Destructive: Story = {
  play: playA11y,
  args: {variant: 'destructive', label: 'Alert'},
};

export const Outline: Story = {
  play: playA11y,
  args: {variant: 'outline', label: 'Outline'},
};
