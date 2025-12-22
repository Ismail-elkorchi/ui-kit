import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-primitives/register';

type SeparatorArgs = {
  orientation: 'horizontal' | 'vertical';
};

const meta: Meta<SeparatorArgs> = {
  title: 'Primitives/Separator',
  component: 'uik-separator',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: {type: 'radio'},
    },
  },
  render: args => {
    if (args.orientation === 'vertical') {
      return html`
        <div style="display: flex; align-items: center; gap: 1rem; height: 140px; padding: 1rem;">
          <span>Left</span>
          <uik-separator orientation="vertical"></uik-separator>
          <span>Right</span>
        </div>
      `;
    }

    return html`
      <div style="display: grid; gap: 0.75rem; padding: 1rem; width: min(420px, 90vw);">
        <span>Top</span>
        <uik-separator orientation="horizontal"></uik-separator>
        <span>Bottom</span>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<SeparatorArgs>;

export const Default: Story = {};
