import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

type BoxArgs = {
  padding: '0' | '1' | '2' | '3' | '4' | '5' | '6';
  inline: boolean;
};

const meta: Meta<BoxArgs> = {
  title: 'Primitives/Box',
  component: 'uik-box',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    padding: '4',
    inline: false,
  },
  render: args => html`
    <uik-box padding=${args.padding} ?inline=${args.inline}>
      <uik-text size="md">Token-backed box content</uik-text>
    </uik-box>
  `,
};

export default meta;

type Story = StoryObj<BoxArgs>;


export const Default: Story = {
  ...interactionStory,
};
