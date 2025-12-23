import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type ButtonArgs = {
  label: string;
  variant: 'solid' | 'danger' | 'outline' | 'secondary' | 'ghost' | 'link';
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
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A11y: native <button> semantics, ensure visible text/aria-label, use disabled for non-interactive state.',
      },
    },
  },
  args: {
    label: 'Click me',
    variant: 'solid',
    size: 'default',
    disabled: false,
    active: false,
    muted: false,
    type: 'button',
  },
  argTypes: {
    variant: {
      options: ['solid', 'danger', 'outline', 'secondary', 'ghost', 'link'],
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
    <div style="display: inline-flex; gap: var(--uik-space-3); align-items: center; padding: var(--uik-space-4);">
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

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Solid: Story = {
  play: playA11y,
};

export const Danger: Story = {
  play: playA11y,
  args: {variant: 'danger', label: 'Delete'},
};

export const GhostMuted: Story = {
  play: playA11y,
  args: {variant: 'ghost', label: 'Muted ghost', muted: true},
};

export const IconButton: Story = {
  play: playA11y,
  args: {label: '★', size: 'icon', variant: 'secondary', type: 'button'},
  render: ({label, ...args}) => html`
    <div style="display: inline-flex; gap: var(--uik-space-3); align-items: center; padding: var(--uik-space-4);">
      <uik-button
        variant=${args.variant}
        size=${args.size}
        type=${args.type}
        aria-label="Favorite"
        ?disabled=${args.disabled}
        ?active=${args.active}
        ?muted=${args.muted}>
        ${label}
      </uik-button>
    </div>
  `,
};
