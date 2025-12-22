import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-primitives/register';

type BadgeArgs = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

const meta: Meta<BadgeArgs> = {
  title: 'Primitives/Badge',
  component: 'uik-badge',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
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
    <div style="display: inline-flex; gap: 0.75rem; align-items: center; padding: 1rem;">
      <uik-badge variant=${args.variant}>${label}</uik-badge>
    </div>
  `,
};

export default meta;

type Story = StoryObj<BadgeArgs>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {variant: 'secondary', label: 'Secondary'},
};

export const Destructive: Story = {
  args: {variant: 'destructive', label: 'Alert'},
};

export const Outline: Story = {
  args: {variant: 'outline', label: 'Outline'},
};
