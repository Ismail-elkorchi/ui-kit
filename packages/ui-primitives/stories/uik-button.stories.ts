import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-primitives/register';

type ButtonArgs = {
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  disabled: boolean;
  active: boolean;
  muted: boolean;
  type: 'button' | 'submit' | 'reset';
};

const meta: Meta<ButtonArgs> = {
  title: 'Primitives/Button',
  component: 'uik-button',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    label: 'Click me',
    variant: 'default',
    size: 'default',
    disabled: false,
    active: false,
    muted: false,
    type: 'button',
  },
  argTypes: {
    variant: {
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      control: {type: 'select'},
    },
    size: {
      options: ['default', 'sm', 'lg', 'icon'],
      control: {type: 'select'},
    },
    type: {
      options: ['button', 'submit', 'reset'],
      control: {type: 'radio'},
    },
  },
  render: ({label, ...args}) => html`
    <div style="display: inline-flex; gap: 0.75rem; align-items: center; padding: 1rem;">
      <uik-button
        variant=${args.variant}
        size=${args.size}
        type=${args.type}
        ?disabled=${args.disabled}
        ?active=${args.active}
        ?muted=${args.muted}>
        ${label}
      </uik-button>
    </div>
  `,
};

export default meta;

type Story = StoryObj<ButtonArgs>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {variant: 'destructive', label: 'Delete'},
};

export const GhostMuted: Story = {
  args: {variant: 'ghost', label: 'Muted ghost', muted: true},
};

export const IconButton: Story = {
  args: {label: '★', size: 'icon', variant: 'secondary', type: 'button'},
};
