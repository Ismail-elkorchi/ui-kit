import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';

const items = [
  {
    id: 'explorer',
    label: 'Explorer',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  },
  {
    id: 'search',
    label: 'Search',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
] as const;

type ActivityBarArgs = {
  activeId: string;
};

const meta: Meta<ActivityBarArgs> = {
  title: 'Shell/Activity Bar',
  component: 'uik-shell-activity-bar',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Props: items, activeId. Event: activity-bar-select.',
          'Slots: footer.',
          'Parts: activity-bar, item, item-indicator, item-button, item-icon, spacer, footer.',
          'Custom properties: `--uik-component-shell-activity-bar-bg`, `--uik-component-shell-activity-bar-fg`, `--uik-component-shell-activity-bar-width`.',
        ].join('\n'),
      },
    },
  },
  args: {
    activeId: 'explorer',
  },
  argTypes: {
    activeId: {
      options: items.map(item => item.id),
      control: {type: 'select'},
    },
  },
  render: args => html`
    <div style="height: var(--uik-layout-panel-width-md);">
      <uik-shell-activity-bar .items=${items} .activeId=${args.activeId}>
        <div
          slot="footer"
          style="
            padding-bottom: var(--uik-space-2);
            font-size: var(--uik-typography-font-size-1);
            line-height: var(--uik-typography-line-height-2);
            color: oklch(var(--uik-text-muted));
          ">
          v0.1
        </div>
      </uik-shell-activity-bar>
    </div>
  `,
};

export default meta;

type Story = StoryObj<ActivityBarArgs>;

export const Default: Story = {};
