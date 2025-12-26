import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

type BadgeArgs = {
  label: string;
  variant: 'default' | 'secondary' | 'danger' | 'outline';
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
      options: ['default', 'secondary', 'danger', 'outline'],
      control: {type: 'select'},
    },
  },
  render: ({label, ...args}) => html`<uik-badge variant=${args.variant}>${label}</uik-badge>`,
};

export default meta;

type Story = StoryObj<BadgeArgs>;


export const Default: Story = {
  ...interactionStory,
};

export const Secondary: Story = {
  ...interactionStory,
  args: {variant: 'secondary', label: 'Secondary'},
};

export const Danger: Story = {
  ...interactionStory,
  args: {variant: 'danger', label: 'Alert'},
};

export const Outline: Story = {
  ...interactionStory,
  args: {variant: 'outline', label: 'Outline'},
};
