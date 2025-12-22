import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
import '@ismail-elkorchi/ui-primitives/register';

type InputArgs = {
  type: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  label: string;
};

const meta: Meta<InputArgs> = {
  title: 'Primitives/Input',
  component: 'uik-input',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  args: {
    type: 'text',
    placeholder: 'Type here...',
    value: '',
    disabled: false,
    label: 'Input field',
  },
  argTypes: {
    type: {
      control: {type: 'text'},
    },
  },
  render: args => html`
    <div style="padding: 1rem; width: min(360px, 90vw);">
      <uik-input
        type=${args.type}
        aria-label=${args.label}
        placeholder=${args.placeholder}
        .value=${args.value}
        ?disabled=${args.disabled}
        label=${args.label}></uik-input>
    </div>
  `,
};

export default meta;

type Story = StoryObj<InputArgs>;

export const Default: Story = {};

export const Filled: Story = {
  args: {value: 'hello@uik.dev'},
};

export const Disabled: Story = {
  args: {disabled: true, placeholder: 'Disabled'},
};
