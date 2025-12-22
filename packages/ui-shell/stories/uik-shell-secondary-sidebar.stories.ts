import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';

type SecondarySidebarArgs = {
  open: boolean;
  heading: string;
  showFooter: boolean;
};

const meta: Meta<SecondarySidebarArgs> = {
  title: 'Shell/Secondary Sidebar',
  component: 'uik-shell-secondary-sidebar',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    open: true,
    heading: 'Assistant',
    showFooter: true,
  },
  render: args => {
    const body = html`
      <div class="space-y-3">
        <p>Summarize the last commit.</p>
        <p class="text-xs text-muted-foreground">Tip: keep it short and focused.</p>
      </div>
    `;

    const footer = args.showFooter
      ? html`<div class="text-xs text-muted-foreground">Powered by UIK</div>`
      : undefined;

    return html`
      <div style="height: 360px;">
        <uik-shell-secondary-sidebar
          ?open=${args.open}
          heading=${args.heading}
          .body=${body}
          .footer=${footer}></uik-shell-secondary-sidebar>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<SecondarySidebarArgs>;

export const Default: Story = {};
