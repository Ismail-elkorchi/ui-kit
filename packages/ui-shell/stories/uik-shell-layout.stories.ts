import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';
import '@ismail-elkorchi/ui-primitives/register';

import {interactionStory} from '../../../.storybook/a11y';

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
  parameters: {
    layout: 'fullscreen',
    uikA11y: {skipMainWrapper: true},
    docs: {
      description: {
        component: [
          'Props: isSecondarySidebarVisible.',
          'Slots: activity-bar, primary-sidebar, main-content, secondary-sidebar, status-bar.',
          'Parts: layout, row, activity-bar, primary-sidebar, main-content, secondary-sidebar, status-bar.',
          'Custom properties: `--uik-surface-bg`, `--uik-text-default`.',
        ].join('\n'),
      },
    },
  },
  args: {
    isSecondarySidebarVisible: true,
  },
  render: args => {
    const activityBar = html`
      <uik-shell-activity-bar slot="activity-bar" .items=${activityItems} activeId="explorer">
      </uik-shell-activity-bar>
    `;

    const primarySidebar = html`
      <uik-shell-sidebar slot="primary-sidebar" heading="Explorer" subtitle="Workspace">
        <uik-button slot="actions" variant="ghost" size="icon" aria-label="Add">+</uik-button>
        <div style="display: flex; flex-direction: column; gap: var(--uik-space-2);">
          <div style="font-size: var(--uik-typography-font-size-2);">src</div>
          <div
            style="
              font-size: var(--uik-typography-font-size-2);
              color: oklch(var(--uik-text-muted));
            ">
            components
          </div>
          <div
            style="
              font-size: var(--uik-typography-font-size-2);
              color: oklch(var(--uik-text-muted));
            ">
            tokens
          </div>
        </div>
      </uik-shell-sidebar>
    `;

    const mainContent = html`
      <main
        slot="main-content"
        style="
          display: flex;
          flex: 1 1 auto;
          min-height: var(--uik-space-0);
          flex-direction: column;
        ">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-inline: var(--uik-space-4);
            height: var(--uik-size-control-md);
            border-bottom: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
          ">
          <div
            style="
              font-size: var(--uik-typography-font-size-2);
              font-weight: var(--uik-typography-font-weight-medium);
            ">
            Editor
          </div>
          <div
            style="
              font-size: var(--uik-typography-font-size-1);
              line-height: var(--uik-typography-line-height-2);
              color: oklch(var(--uik-text-muted));
            ">
            main.ts
          </div>
        </div>
        <div
          style="
            flex: 1 1 auto;
            min-height: var(--uik-space-0);
            overflow: auto;
            padding: var(--uik-space-4);
          ">
          <div
            style="
              background-color: oklch(var(--uik-surface-card));
              border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
              border-radius: var(--uik-radius-3);
              padding: var(--uik-space-4);
              font-size: var(--uik-typography-font-size-2);
              color: oklch(var(--uik-text-muted));
            ">
            Start editing to see live changes.
          </div>
        </div>
      </main>
    `;

    const secondarySidebar = html`
      <uik-shell-secondary-sidebar
        slot="secondary-sidebar"
        .isOpen=${args.isSecondarySidebarVisible}
        heading="Assistant">
        <p
          style="
            font-size: var(--uik-typography-font-size-2);
            color: oklch(var(--uik-text-muted));
          ">
          Context-aware suggestions appear here.
        </p>
        <div
          slot="footer"
          style="
            font-size: var(--uik-typography-font-size-1);
            line-height: var(--uik-typography-line-height-2);
            color: oklch(var(--uik-text-muted));
          ">
          AI Ready
        </div>
      </uik-shell-secondary-sidebar>
    `;

    const statusBar = html`
      <uik-shell-status-bar slot="status-bar" message="Ready" tone="info" meta="3 files selected">
        <span
          slot="actions"
          style="
            font-size: var(--uik-typography-font-size-1);
            line-height: var(--uik-typography-line-height-2);
            color: oklch(var(--uik-text-muted));
          ">
          Main
        </span>
      </uik-shell-status-bar>
    `;

    return html`
      <div
        style="
          height: var(--uik-layout-panel-width-lg);
          border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
        ">
        <uik-shell-layout ?isSecondarySidebarVisible=${args.isSecondarySidebarVisible}>
          ${activityBar} ${primarySidebar} ${mainContent} ${secondarySidebar} ${statusBar}
        </uik-shell-layout>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<LayoutArgs>;

export const Default: Story = {
  ...interactionStory,
};
