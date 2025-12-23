import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';
import '@ismail-elkorchi/ui-primitives/register';

const activityItems = [
  {
    id: 'explorer',
    label: 'Explorer',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  },
  {id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'},
] as const;

type LayoutArgs = {
  isSecondarySidebarVisible: boolean;
};

const meta: Meta<LayoutArgs> = {
  title: 'Shell/Layout',
  component: 'uik-shell-layout',
  tags: ['autodocs'],
  parameters: {layout: 'fullscreen'},
  args: {
    isSecondarySidebarVisible: true,
  },
  render: args => {
    const activityBar = html`
      <uik-shell-activity-bar .items=${activityItems} activeId="explorer"></uik-shell-activity-bar>
    `;

    const primarySidebar = html`
      <uik-shell-sidebar
        heading="Explorer"
        subtitle="Workspace"
        .actions=${html`
          <uik-button variant="ghost" size="icon" aria-label="Add">+</uik-button>
        `}
        .body=${html`
          <div class="space-y-2">
            <div class="text-sm">src</div>
            <div class="text-sm text-muted-foreground">components</div>
            <div class="text-sm text-muted-foreground">tokens</div>
          </div>
        `}></uik-shell-sidebar>
    `;

    const mainContent = html`
      <main class="flex-1 min-h-0 flex flex-col">
        <div class="flex items-center justify-between px-4 h-10 border-b border-border">
          <div class="text-sm font-medium">Editor</div>
          <div class="text-xs text-muted-foreground">main.ts</div>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <div class="bg-card border border-border rounded-md p-4 text-sm text-muted-foreground">
            Start editing to see live changes.
          </div>
        </div>
      </main>
    `;

    const secondarySidebar = html`
      <uik-shell-secondary-sidebar
        .isOpen=${true}
        heading="Assistant"
        .body=${html`<p class="text-sm text-muted-foreground">Context-aware suggestions appear here.</p>`}
        .footer=${html`<div class="text-xs text-muted-foreground">AI Ready</div>`}></uik-shell-secondary-sidebar>
    `;

    const statusBar = html`
      <uik-shell-status-bar message="Ready" tone="info" .meta=${'3 files selected'}></uik-shell-status-bar>
    `;

    return html`
      <div style="height: 520px; border: 1px solid oklch(var(--uik-border-default));">
        <uik-shell-layout
          ?isSecondarySidebarVisible=${args.isSecondarySidebarVisible}
          .activityBar=${activityBar}
          .primarySidebar=${primarySidebar}
          .mainContent=${mainContent}
          .secondarySidebar=${secondarySidebar}
          .statusBar=${statusBar}></uik-shell-layout>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<LayoutArgs>;

export const Default: Story = {};
