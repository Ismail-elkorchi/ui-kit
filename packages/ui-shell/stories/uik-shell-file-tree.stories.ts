import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-shell/register';
import '@ismail-elkorchi/ui-primitives/register';

import type {UikShellFileTreeNode} from '../index';

const items: UikShellFileTreeNode[] = [
  {
    path: '/apps',
    name: 'apps',
    isDirectory: true,
    children: [
      {
        path: '/apps/ui',
        name: 'ui',
        isDirectory: true,
        children: [
          {path: '/apps/ui/main.ts', name: 'main.ts', isDirectory: false},
          {path: '/apps/ui/styles.css', name: 'styles.css', isDirectory: false},
        ],
      },
      {path: '/apps/desktop', name: 'desktop', isDirectory: true, children: []},
    ],
  },
  {path: '/README.md', name: 'README.md', isDirectory: false},
];

type FileTreeArgs = {
  selectedPaths: string[];
  openPaths: string[];
};

const meta: Meta<FileTreeArgs> = {
  title: 'Shell/File Tree',
  component: 'uik-shell-file-tree',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Props: items, selectedPaths, openPaths.',
          'Events: file-tree-select, file-tree-open, file-tree-toggle.',
          'Parts: tree, row, toggle, checkbox, label, children.',
          'Custom properties: `--uik-component-shell-file-tree-row-bg`, `--uik-component-shell-file-tree-row-hover-bg`, `--uik-component-shell-file-tree-row-active-bg`, `--uik-component-shell-file-tree-row-height`, `--uik-component-shell-file-tree-row-gap`, `--uik-component-shell-file-tree-row-padding-x`, `--uik-component-shell-file-tree-row-radius`, `--uik-component-shell-file-tree-indent`, `--uik-component-shell-file-tree-text-file`, `--uik-component-shell-file-tree-text-folder`, `--uik-component-shell-file-tree-text-hover`, `--uik-component-shell-file-tree-toggle-fg`.',
        ].join('\n'),
      },
    },
  },
  args: {
    selectedPaths: ['/apps/ui/main.ts'],
    openPaths: ['/apps', '/apps/ui'],
  },
  render: args => html`
    <div
      style="
        width: var(--uik-layout-panel-width-md);
        height: var(--uik-layout-panel-width-sm);
        background: oklch(var(--uik-surface-bg));
        border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
        padding: var(--uik-space-2);
        box-sizing: border-box;
      ">
      <uik-shell-file-tree .items=${items} .selectedPaths=${args.selectedPaths} .openPaths=${args.openPaths}>
      </uik-shell-file-tree>
    </div>
  `,
};

export default meta;

type Story = StoryObj<FileTreeArgs>;

export const Default: Story = {};
