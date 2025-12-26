import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

type StackArgs = {
  direction: 'vertical' | 'horizontal';
  gap: '1' | '2' | '3' | '4' | '5' | '6';
  align: 'start' | 'center' | 'end' | 'stretch';
  justify: 'start' | 'center' | 'end' | 'between';
};

const meta: Meta<StackArgs> = {
  title: 'Primitives/Stack',
  component: 'uik-stack',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    direction: 'vertical',
    gap: '3',
    align: 'stretch',
    justify: 'start',
  },
  render: args => html`
    <uik-stack direction=${args.direction} gap=${args.gap} align=${args.align} justify=${args.justify}>
      <uik-button variant="secondary">First</uik-button>
      <uik-button variant="secondary">Second</uik-button>
      <uik-button variant="secondary">Third</uik-button>
    </uik-stack>
  `,
};

export default meta;

type Story = StoryObj<StackArgs>;


export const Default: Story = {
  ...interactionStory,
};
