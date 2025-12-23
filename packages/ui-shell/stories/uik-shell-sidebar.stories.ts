import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';
import '@ismail-elkorchi/ui-primitives/register';

type SidebarArgs = {
  heading: string;
  subtitle: string;
  isBodyPadded: boolean;
  isBodyScrollable: boolean;
  isFooterVisible: boolean;
};

const meta: Meta<SidebarArgs> = {
  title: 'Shell/Sidebar',
  component: 'uik-shell-sidebar',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    heading: 'Explorer',
    subtitle: 'Workspace',
    isBodyPadded: true,
    isBodyScrollable: true,
    isFooterVisible: true,
  },
  render: args => {
    const actions = html`
      <uik-button variant="ghost" size="icon" aria-label="Add">
        <span>+</span>
      </uik-button>
      <uik-button variant="ghost" size="icon" aria-label="More">
        <span>...</span>
      </uik-button>
    `;

    const body = html`
      <div class="text-xs text-muted-foreground">Recent</div>
      <div class="space-y-2">
        <div class="text-sm">design-system</div>
        <div class="text-sm text-muted-foreground">marketing-site</div>
        <div class="text-sm text-muted-foreground">platform-app</div>
      </div>
    `;

    const footer = args.isFooterVisible
      ? html`<div class="text-xs text-muted-foreground">3 workspaces</div>`
      : undefined;

    return html`
      <div style="height: 360px;">
        <uik-shell-sidebar
          heading=${args.heading}
          subtitle=${args.subtitle}
          ?isBodyPadded=${args.isBodyPadded}
          ?isBodyScrollable=${args.isBodyScrollable}
          .actions=${actions}
          .body=${body}
          .footer=${footer}></uik-shell-sidebar>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<SidebarArgs>;

export const Default: Story = {};
