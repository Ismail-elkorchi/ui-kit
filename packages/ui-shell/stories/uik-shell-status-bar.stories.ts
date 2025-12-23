import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';

type StatusBarArgs = {
  message: string;
  tone: 'info' | 'success' | 'danger' | 'muted';
  meta: string;
};

const meta: Meta<StatusBarArgs> = {
  title: 'Shell/Status Bar',
  component: 'uik-shell-status-bar',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    message: 'Ready',
    tone: 'info',
    meta: '3 files selected',
  },
  argTypes: {
    tone: {
      options: ['info', 'success', 'danger', 'muted'],
      control: {type: 'select'},
    },
  },
  render: args => html`
    <div style="width: min(720px, 95vw);">
      <uik-shell-status-bar
        message=${args.message}
        tone=${args.tone}
        .meta=${args.meta}
        .actions=${html`<span class="text-xs text-muted-foreground">Main</span>`}></uik-shell-status-bar>
    </div>
  `,
};

export default meta;

type Story = StoryObj<StatusBarArgs>;

export const Default: Story = {};
