import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';

type StatusbarArgs = {
  message: string;
  tone: 'info' | 'success' | 'error' | 'muted';
  meta: string;
};

const meta: Meta<StatusbarArgs> = {
  title: 'Shell/Statusbar',
  component: 'uik-shell-statusbar',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    message: 'Ready',
    tone: 'info',
    meta: '3 files selected',
  },
  argTypes: {
    tone: {
      options: ['info', 'success', 'error', 'muted'],
      control: {type: 'select'},
    },
  },
  render: args => html`
    <div style="width: min(720px, 95vw);">
      <uik-shell-statusbar
        message=${args.message}
        tone=${args.tone}
        .meta=${args.meta}
        .actions=${html`<span class="text-xs text-muted-foreground">Main</span>`}></uik-shell-statusbar>
    </div>
  `,
};

export default meta;

type Story = StoryObj<StatusbarArgs>;

export const Default: Story = {};
