import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {runA11y} from '../../../.storybook/a11y';

type NavArgs = {
  currentId: string;
  openIds: string[];
};

const items = [
  {
    id: 'docs',
    label: 'Docs',
    children: [
      {id: 'docs/getting-started', label: 'Getting started', href: '#docs/getting-started'},
      {id: 'docs/tokens', label: 'Tokens', href: '#docs/tokens'},
      {id: 'docs/primitives', label: 'Primitives', href: '#docs/primitives'},
    ],
  },
  {
    id: 'lab',
    label: 'Lab',
    children: [
      {id: 'lab/shell-patterns', label: 'Shell patterns', href: '#lab/shell-patterns'},
      {id: 'lab/overlays', label: 'Overlays', href: '#lab/overlays'},
    ],
  },
];

const meta: Meta<NavArgs> = {
  title: 'Primitives/Nav',
  component: 'uik-nav',
  tags: ['autodocs'],
  args: {
    currentId: 'docs/getting-started',
    openIds: ['docs', 'lab'],
  },
  render: args => html`
    <uik-nav .items=${items} .openIds=${args.openIds} currentId=${args.currentId} aria-label="Docs navigation">
    </uik-nav>
  `,
};

export default meta;

type Story = StoryObj<NavArgs>;

const playA11y = async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement);

export const Default: Story = {
  play: playA11y,
};
