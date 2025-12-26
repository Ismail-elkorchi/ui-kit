import '@ismail-elkorchi/ui-primitives/register';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

import {interactionStory} from '../../../.storybook/a11y';

type DialogArgs = {
  open: boolean;
  modal: boolean;
};

const meta: Meta<DialogArgs> = {
  title: 'Primitives/Dialog',
  component: 'uik-dialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    modal: false,
  },
  render: args => html`
    <uik-dialog ?open=${args.open} ?modal=${args.modal}>
      <span slot="title">Invite team</span>
      <span slot="description">Share the link below with your teammates.</span>
      <uik-input placeholder="team@uik.dev" aria-label="Invitee email"></uik-input>
      <uik-stack slot="actions" direction="horizontal" gap="2" justify="end">
        <uik-button variant="secondary">Cancel</uik-button>
        <uik-button>Send invite</uik-button>
      </uik-stack>
    </uik-dialog>
  `,
};

export default meta;

type Story = StoryObj<DialogArgs>;


export const Default: Story = {
  ...interactionStory,
};
