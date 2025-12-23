import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type IconArgs = {
  size: 'xs' | 'sm' | 'md' | 'lg';
  tone: 'default' | 'muted' | 'danger' | 'success' | 'warning' | 'info' | 'inverse';
  label: string;
};

const meta: Meta<IconArgs> = {
  title: 'Primitives/Icon',
  component: 'uik-icon',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A11y: set aria-label for meaningful icons or aria-hidden for decorative ones.',
      },
    },
  },
  args: {
    size: 'md',
    tone: 'default',
    label: 'Search',
  },
  render: args => html`
    <uik-icon size=${args.size} tone=${args.tone} aria-label=${args.label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6.5 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      </svg>
    </uik-icon>
  `,
};

export default meta;

type Story = StoryObj<IconArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};

export const Muted: Story = {
  play: playA11y,
  args: {tone: 'muted', label: 'Muted icon'},
};
